-- ============================================================
-- SDAS Migration 002 — Fix evaluate_water_level trigger
-- PostgreSQL format() uses %s not %.1f
-- ============================================================

CREATE OR REPLACE FUNCTION evaluate_water_level()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_alert_type TEXT;
  v_severity   TEXT;
  v_message    TEXT;
  v_last_type  TEXT;
BEGIN
  SELECT alert_type INTO v_last_type
  FROM alerts ORDER BY created_at DESC LIMIT 1;

  IF NEW.water_level >= 85 THEN
    v_alert_type := 'DANGER';
    v_severity   := 'EMERGENCY';
    v_message    := 'DANGER: Water level at ' || round(NEW.water_level::numeric, 1)::text || '%. Gate fully open. Evacuate immediately.';
  ELSIF NEW.water_level >= 70 THEN
    v_alert_type := 'PRE_WARNING';
    v_severity   := 'WARNING';
    v_message    := 'PRE-WARNING: Water level at ' || round(NEW.water_level::numeric, 1)::text || '%. Gate opening 30%.';
  ELSE
    v_alert_type := 'NORMAL';
    v_severity   := 'INFO';
    v_message    := 'NORMAL: Water level at ' || round(NEW.water_level::numeric, 1)::text || '%.';
  END IF;

  IF v_alert_type IS DISTINCT FROM v_last_type THEN
    INSERT INTO alerts (alert_type, severity, message, water_level)
    VALUES (v_alert_type, v_severity, v_message, NEW.water_level);
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS trg_evaluate_water_level ON sensor_readings;
CREATE TRIGGER trg_evaluate_water_level
  AFTER INSERT ON sensor_readings
  FOR EACH ROW EXECUTE FUNCTION evaluate_water_level();

-- Also fix the handle_new_user function (safe, just recreate)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'OPERATOR')
  );
  RETURN NEW;
END;
$$;
