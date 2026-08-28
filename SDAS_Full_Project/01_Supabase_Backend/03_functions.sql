-- ============================================================
-- SDAS Smart Dam Alert System
-- Database Functions, Triggers & RPCs v2.0
-- Run this THIRD (after 02_security.sql)
-- ============================================================

-- ─── ALERT & GATE EVALUATION FUNCTION ────────────────────────
-- Automatically calculates rate-of-rise (cm/min or %/min) from consecutive readings
-- Strictly adheres to the canonical SDAS 4-Tier Safety Matrix:
-- Tier 1: <= 70.0%          -> NORMAL       -> Gate 0% (0° Closed, LED GREEN)
-- Tier 2: 70.1-85.0% Stable -> PRE-WARNING  -> Gate 0% (0° Closed, LED YELLOW)
-- Tier 3: 70.1-85.0% Rapid  -> WARNING      -> Gate 20% (36° Buffer, LED AMBER)
-- Tier 4: > 85.0%           -> DANGER       -> Gate 50% (90° Spillway, LED RED, BUZZER ON)

CREATE OR REPLACE FUNCTION evaluate_water_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prev_level    NUMERIC(5, 2);
  v_prev_time     TIMESTAMPTZ;
  v_time_diff_min NUMERIC;
  v_rate_of_rise  NUMERIC(5, 2) := 0.0;
  v_alert_type    TEXT;
  v_severity      TEXT;
  v_message       TEXT;
  v_last_type     TEXT;
BEGIN
  -- 1. Retrieve previous chronological reading for this device to calculate rate of rise
  SELECT water_level, created_at INTO v_prev_level, v_prev_time
  FROM sensor_readings
  WHERE device_id = NEW.device_id AND id != NEW.id
  ORDER BY created_at DESC
  LIMIT 1;

  -- 2. Compute rate-of-rise in %/min (if consecutive readings within 15 minutes)
  IF v_prev_level IS NOT NULL AND v_prev_time IS NOT NULL THEN
    v_time_diff_min := EXTRACT(EPOCH FROM (NEW.created_at - v_prev_time)) / 60.0;
    IF v_time_diff_min > 0.05 AND v_time_diff_min <= 15.0 THEN
      v_rate_of_rise := (NEW.water_level - v_prev_level) / v_time_diff_min;
    END IF;
  END IF;

  -- 3. Retrieve last alert type for hysteresis deduplication
  SELECT alert_type INTO v_last_type
  FROM alerts
  ORDER BY created_at DESC
  LIMIT 1;

  -- 4. Evaluate Canonical 4-Tier SDAS Matrix
  -- Tier 1: < 70.0%             -> NORMAL (0% Closed)
  -- Tier 2: 70.0% - 85.0% Stable -> PRE_WARNING (0% Closed)
  -- Tier 3: 70.0% - 85.0% Rapid  -> WARNING (20% Buffer)
  -- Tier 4: > 85.0%              -> DANGER (50% Spillway)
  IF NEW.water_level > 85.0 THEN
    v_alert_type := 'DANGER';
    v_severity   := 'EMERGENCY';
    v_message    := format('DANGER: Water level at %.1f%% (>85.0%% critical). Sluice gate actuated to 50%% (90° Emergency Spillway). Immediate evacuation.', NEW.water_level);

  ELSIF NEW.water_level >= 70.0 THEN
    -- Threshold equivalent to 0.30% per 2-second edge sampling, normalized to 9.00% per minute for timestamp-based cloud evaluation.
    IF v_rate_of_rise > 9.00 THEN
      v_alert_type := 'WARNING';
      v_severity   := 'HIGH';
      v_message    := format('WARNING: Water level at %.1f%% with rapid surge (+%.2f%%/min). Sluice gate actuated to 20%% (36° Buffer Pre-Drain).', NEW.water_level, v_rate_of_rise);
    ELSE
      v_alert_type := 'PRE_WARNING';
      v_severity   := 'WARNING';
      v_message    := format('PRE-WARNING: Water level at %.1f%% (stable inflow, rate: +%.2f%%/min). Sluice gate held CLOSED at 0° (Water Conservation).', NEW.water_level, v_rate_of_rise);
    END IF;

  ELSE
    v_alert_type := 'NORMAL';
    v_severity   := 'INFO';
    v_message    := format('NORMAL: Water level at %.1f%% (<70.0%% normal hold). Sluice gate closed (0° Water Conservation).', NEW.water_level);
  END IF;

  -- 5. Insert alert record if alert type changed or if in active emergency
  IF v_alert_type IS DISTINCT FROM v_last_type OR v_alert_type = 'DANGER' THEN
    INSERT INTO alerts (alert_type, severity, message, water_level)
    VALUES (v_alert_type, v_severity, v_message, NEW.water_level);
  END IF;

  -- 6. Insert automated gate actuation command per SDAS 4-Tier Policy
  IF v_alert_type = 'DANGER' THEN
    INSERT INTO gate_control (gate_percentage, mode, command, led_color, buzzer_active)
    VALUES (50, 'AUTO', 'EMERGENCY_50', 'RED', TRUE);
  ELSIF v_alert_type = 'WARNING' THEN
    INSERT INTO gate_control (gate_percentage, mode, command, led_color, buzzer_active)
    VALUES (20, 'AUTO', 'BUFFER_20', 'AMBER', FALSE);
  ELSIF v_alert_type = 'PRE_WARNING' THEN
    -- In PRE_WARNING, gate is strictly CLOSED (0%) to conserve water while alerting downstream officers
    INSERT INTO gate_control (gate_percentage, mode, command, led_color, buzzer_active)
    VALUES (0, 'AUTO', 'PRE_WARNING_HOLD_0', 'YELLOW', FALSE);
  ELSE
    INSERT INTO gate_control (gate_percentage, mode, command, led_color, buzzer_active)
    VALUES (0, 'AUTO', 'NORMAL_CLOSED_0', 'GREEN', FALSE);
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to sensor_readings table
DROP TRIGGER IF EXISTS trg_evaluate_water_level ON sensor_readings;
CREATE TRIGGER trg_evaluate_water_level
  AFTER INSERT ON sensor_readings
  FOR EACH ROW
  EXECUTE FUNCTION evaluate_water_level();

-- ─── ATOMIC COMMUNITY CONFIRMATION RPC ───────────────────────
CREATE OR REPLACE FUNCTION increment_community_confirmation(
  p_report_id BIGINT,
  p_user_identifier TEXT
)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  -- 1. Insert into unique confirmations table (idempotent)
  INSERT INTO community_report_confirmations (report_id, user_identifier)
  VALUES (p_report_id, p_user_identifier)
  ON CONFLICT (report_id, user_identifier) DO NOTHING;

  -- 2. Recalculate true confirmation count from relation
  SELECT COUNT(*) INTO v_new_count
  FROM community_report_confirmations
  WHERE report_id = p_report_id;

  -- 3. Update parent report record
  UPDATE community_reports
  SET confirmation_count = GREATEST(1, v_new_count)
  WHERE id = p_report_id;

  RETURN GREATEST(1, v_new_count);
END;
$$;

-- ─── HELPER VIEWS ────────────────────────────────────────────

-- Latest sensor reading (used by both apps)
CREATE OR REPLACE VIEW v_latest_reading AS
SELECT
  id,
  device_id,
  water_level,
  temperature,
  humidity,
  sensor_health,
  created_at
FROM sensor_readings
ORDER BY created_at DESC
LIMIT 1;

-- Last 24 hours of readings (used for charts)
CREATE OR REPLACE VIEW v_readings_24h AS
SELECT
  id,
  water_level,
  temperature,
  humidity,
  sensor_health,
  created_at
FROM sensor_readings
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at ASC;

-- Active (unacknowledged) alerts
CREATE OR REPLACE VIEW v_active_alerts AS
SELECT *
FROM alerts
WHERE acknowledged = FALSE
ORDER BY created_at DESC;

-- ─── HAVERSINE DISTANCE & PUBLIC SUBSCRIBER REGISTRATION ──────
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
    lat1 FLOAT, lon1 FLOAT,
    lat2 FLOAT, lon2 FLOAT
) RETURNS FLOAT
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    r FLOAT := 6371.0; -- Earth radius in km
    dlat FLOAT;
    dlon FLOAT;
    a FLOAT;
    c FLOAT;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat / 2.0)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2.0)^2;
    c := 2.0 * asin(sqrt(a));
    RETURN ROUND((r * c)::numeric, 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.register_public_subscriber(
    p_full_name TEXT,
    p_phone_number TEXT,
    p_latitude FLOAT,
    p_longitude FLOAT,
    p_area_name TEXT,
    p_receive_sms BOOLEAN DEFAULT TRUE
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_dam_lat FLOAT := 8.0450;
    v_dam_lon FLOAT := 79.8850;
    v_dist_km FLOAT;
    v_risk_zone TEXT;
    v_new_id BIGINT;
BEGIN
    -- 1. Compute Haversine distance from Tabbowa Dam
    IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
        v_dist_km := public.calculate_distance_km(v_dam_lat, v_dam_lon, p_latitude, p_longitude);
    ELSE
        v_dist_km := 4.5;
    END IF;

    -- 2. Assign Prototype Distance-Based Notification Zone
    IF v_dist_km <= 3.0 THEN
        v_risk_zone := 'ZONE_1_NEAR_DAM';
    ELSIF v_dist_km <= 8.0 THEN
        v_risk_zone := 'ZONE_2_INTERMEDIATE';
    ELSE
        v_risk_zone := 'ZONE_3_EXTENDED';
    END IF;

    -- 3. Insert or Update Subscriber (Initial state: PENDING_VERIFICATION, active=false)
    INSERT INTO public.public_alert_subscribers (
        full_name, phone_number, latitude, longitude, area_name,
        risk_zone, distance_from_dam_km, receive_sms,
        status, verification_status, active
    ) VALUES (
        p_full_name, p_phone_number, p_latitude, p_longitude, p_area_name,
        v_risk_zone, v_dist_km, p_receive_sms,
        'PENDING_VERIFICATION', 'PENDING', FALSE
    )
    ON CONFLICT (phone_number) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        area_name = EXCLUDED.area_name,
        risk_zone = EXCLUDED.risk_zone,
        distance_from_dam_km = EXCLUDED.distance_from_dam_km,
        receive_sms = EXCLUDED.receive_sms
    RETURNING id INTO v_new_id;

    -- 4. Record Audit Log
    INSERT INTO public.sms_dispatch_logs (
        action, alert_type, priority, target_zone, recipient_count, performed_by, message_body, status, details
    ) VALUES (
        'SUBSCRIBER_REGISTERED', 'PRE_WARNING', 'INFO', v_risk_zone, 1, 'CITIZEN',
        format('Citizen %s registered for %s (dist: %.1f km). Pending verification.', p_full_name, v_risk_zone, v_dist_km),
        'SENT',
        jsonb_build_object('phone', p_phone_number, 'distance_km', v_dist_km, 'zone', v_risk_zone)
    );

    RETURN jsonb_build_object(
        'success', true,
        'subscriber_id', v_new_id,
        'risk_zone', v_risk_zone,
        'distance_km', v_dist_km,
        'status', 'PENDING_VERIFICATION',
        'message', 'Registration submitted successfully. Pending operator verification.'
    );
END;
$$;

-- ─── AUTOMATIC ZONE-BASED SMS RECIPIENTS SELECTOR ─────────────
CREATE OR REPLACE FUNCTION public.get_alert_sms_recipients(
    p_alert_tier TEXT
) RETURNS TABLE (
    recipient_type TEXT,
    name TEXT,
    phone TEXT,
    risk_zone TEXT,
    distance_km FLOAT
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
    IF p_alert_tier = 'DANGER' THEN
        -- DANGER: All emergency contacts + all verified subscribers (Zone 1, 2, 3)
        RETURN QUERY
        SELECT 'OPERATOR'::TEXT, ec.name, ec.phone_number, 'OFFICIAL'::TEXT, 0.0::FLOAT
        FROM public.emergency_contacts ec
        WHERE ec.active = TRUE AND ec.danger_enabled = TRUE
        UNION ALL
        SELECT 'PUBLIC'::TEXT, pas.full_name, pas.phone_number, pas.risk_zone, pas.distance_from_dam_km
        FROM public.public_alert_subscribers pas
        WHERE pas.active = TRUE AND pas.receive_sms = TRUE AND pas.status = 'VERIFIED';

    ELSIF p_alert_tier = 'WARNING' THEN
        -- WARNING: Warning-enabled operators + Zone 1 & Zone 2 verified subscribers
        RETURN QUERY
        SELECT 'OPERATOR'::TEXT, ec.name, ec.phone_number, 'OFFICIAL'::TEXT, 0.0::FLOAT
        FROM public.emergency_contacts ec
        WHERE ec.active = TRUE AND ec.warning_enabled = TRUE
        UNION ALL
        SELECT 'PUBLIC'::TEXT, pas.full_name, pas.phone_number, pas.risk_zone, pas.distance_from_dam_km
        FROM public.public_alert_subscribers pas
        WHERE pas.active = TRUE AND pas.receive_sms = TRUE AND pas.status = 'VERIFIED'
          AND pas.risk_zone IN ('ZONE_1_NEAR_DAM', 'ZONE_2_INTERMEDIATE');

    ELSIF p_alert_tier = 'PRE_WARNING' THEN
        -- PRE-WARNING: Operator monitoring only
        RETURN QUERY
        SELECT 'OPERATOR'::TEXT, ec.name, ec.phone_number, 'OFFICIAL'::TEXT, 0.0::FLOAT
        FROM public.emergency_contacts ec
        WHERE ec.active = TRUE AND ec.warning_enabled = TRUE;

    END IF;
END;
$$;

