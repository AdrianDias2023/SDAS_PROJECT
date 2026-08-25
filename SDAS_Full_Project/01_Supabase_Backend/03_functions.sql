-- ============================================================
-- SDAS Smart Dam Alert System
-- Database Functions & Triggers v2.0
-- Run this THIRD (after 02_security.sql)
-- ============================================================

-- ─── ALERT EVALUATION FUNCTION ───────────────────────────────
-- Automatically evaluates water level and creates alert records
-- Called by the trigger below on every new sensor_reading INSERT

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
    v_message    := format('DANGER: Water level at %.1f%%. Gate fully open. Immediate evacuation required.', NEW.water_level);

  ELSIF NEW.water_level >= 70 THEN
    v_alert_type := 'PRE_WARNING';
    v_severity   := 'WARNING';
    v_message    := format('PRE-WARNING: Water level at %.1f%%. Gate opening 30%%. Monitor closely.', NEW.water_level);

  ELSE
    v_alert_type := 'NORMAL';
    v_severity   := 'INFO';
    v_message    := format('NORMAL: Water level at %.1f%%.', NEW.water_level);
  END IF;

  -- Only insert alert if level changed (basic hysteresis)
  IF v_alert_type IS DISTINCT FROM v_last_type THEN
    INSERT INTO alerts (alert_type, severity, message, water_level)
    VALUES (v_alert_type, v_severity, v_message, NEW.water_level);
  END IF;

  -- Always insert a gate_control record for AUTO mode
  IF v_alert_type = 'DANGER' THEN
    INSERT INTO gate_control (gate_percentage, mode, command, led_color, buzzer_active)
    VALUES (100, 'AUTO', 'FULL_OPEN', 'RED', TRUE);
  ELSIF v_alert_type = 'PRE_WARNING' THEN
    INSERT INTO gate_control (gate_percentage, mode, command, led_color, buzzer_active)
    VALUES (30, 'AUTO', 'OPEN_30', 'YELLOW', FALSE);
  ELSE
    INSERT INTO gate_control (gate_percentage, mode, command, led_color, buzzer_active)
    VALUES (0, 'AUTO', 'CLOSE', 'GREEN', FALSE);
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

-- ─── CLEANUP FUNCTION (optional: remove old readings) ─────────
-- Call weekly to keep DB lean
CREATE OR REPLACE FUNCTION cleanup_old_readings(days_to_keep INT DEFAULT 90)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM sensor_readings
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
END;
$$;
