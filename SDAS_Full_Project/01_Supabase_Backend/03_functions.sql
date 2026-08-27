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
  IF NEW.water_level > 85.0 THEN
    v_alert_type := 'DANGER';
    v_severity   := 'EMERGENCY';
    v_message    := format('DANGER: Water level at %.1f%% (>85.0%% critical). Sluice gate actuated to 50%% (90° Emergency Spillway). Immediate evacuation.', NEW.water_level);

  ELSIF NEW.water_level > 70.0 THEN
    -- Rate-of-rise threshold: > 0.50%/min corresponds to rapid flash inflow (>5 cm/min)
    IF v_rate_of_rise > 0.50 THEN
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
    v_message    := format('NORMAL: Water level at %.1f%%. Sluice gate closed (0° Water Conservation).', NEW.water_level);
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
