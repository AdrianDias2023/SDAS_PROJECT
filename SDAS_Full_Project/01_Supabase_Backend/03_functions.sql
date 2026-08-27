-- ============================================================
-- SDAS Smart Dam Alert System
-- Database Functions, Triggers & RPCs v2.0
-- Run this THIRD (after 02_security.sql)
-- ============================================================

-- ─── ALERT EVALUATION FUNCTION ───────────────────────────────
-- Automatically evaluates water level and creates alert records
-- Adheres to canonical SDAS 3-Phase matrix: 0% (0°), 20% (36°), 50% (90°)

CREATE OR REPLACE FUNCTION evaluate_water_level()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_alert_type TEXT;
  v_severity   TEXT;
  v_message    TEXT;
  v_last_type  TEXT;
BEGIN
  -- Get the last alert type (for hysteresis — avoid duplicate alerts)
  SELECT alert_type INTO v_last_type
  FROM alerts
  ORDER BY created_at DESC
  LIMIT 1;

  -- Determine alert level per proposal thresholds
  IF NEW.water_level >= 85 THEN
    v_alert_type := 'DANGER';
    v_severity   := 'EMERGENCY';
    v_message    := format('DANGER: Water level at %.1f%%. Sluice gate actuated to 50%% (90° Emergency Spillway). Immediate evacuation required.', NEW.water_level);

  ELSIF NEW.water_level >= 70 THEN
    v_alert_type := 'PRE_WARNING';
    v_severity   := 'WARNING';
    v_message    := format('PRE-WARNING: Water level at %.1f%%. Sluice gate actuated to 20%% (36° Buffer Pre-Drain). Monitor closely.', NEW.water_level);

  ELSE
    v_alert_type := 'NORMAL';
    v_severity   := 'INFO';
    v_message    := format('NORMAL: Water level at %.1f%%. Sluice gate closed (0° Water Conservation).', NEW.water_level);
  END IF;

  -- Only insert alert if level changed (basic hysteresis)
  IF v_alert_type IS DISTINCT FROM v_last_type THEN
    INSERT INTO alerts (alert_type, severity, message, water_level)
    VALUES (v_alert_type, v_severity, v_message, NEW.water_level);
  END IF;

  -- Always insert a gate_control record for AUTO mode
  IF v_alert_type = 'DANGER' THEN
    INSERT INTO gate_control (gate_percentage, mode, command, led_color, buzzer_active)
    VALUES (50, 'AUTO', 'EMERGENCY_50', 'RED', TRUE);
  ELSIF v_alert_type = 'PRE_WARNING' THEN
    INSERT INTO gate_control (gate_percentage, mode, command, led_color, buzzer_active)
    VALUES (20, 'AUTO', 'BUFFER_20', 'YELLOW', FALSE);
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
