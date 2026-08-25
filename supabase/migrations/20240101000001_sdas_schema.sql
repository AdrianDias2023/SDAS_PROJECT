-- ============================================================
-- SDAS Migration 001 — Full Schema
-- Run via: supabase db push  OR paste into Supabase SQL Editor
-- ============================================================

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'OPERATOR' CHECK (role IN ('ADMIN','OPERATOR')),
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SENSOR READINGS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensor_readings (
  id             BIGSERIAL PRIMARY KEY,
  device_id      TEXT NOT NULL DEFAULT 'ESP32_SDAS_01',
  water_level    FLOAT NOT NULL CHECK (water_level >= 0 AND water_level <= 100),
  temperature    FLOAT,
  humidity       FLOAT,
  rainfall       FLOAT DEFAULT 0,
  sensor1_level  FLOAT,
  sensor2_level  FLOAT,
  sensor_health  TEXT NOT NULL DEFAULT 'NORMAL'
                   CHECK (sensor_health IN ('NORMAL','SENSOR1_FAULT','SENSOR2_FAULT','SENSOR_MISMATCH','DUAL_FAULT')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_created ON sensor_readings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device  ON sensor_readings (device_id, created_at DESC);

-- ─── GATE CONTROL ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gate_control (
  id              BIGSERIAL PRIMARY KEY,
  gate_percentage FLOAT NOT NULL DEFAULT 0 CHECK (gate_percentage >= 0 AND gate_percentage <= 100),
  mode            TEXT NOT NULL DEFAULT 'AUTO' CHECK (mode IN ('AUTO','MANUAL')),
  command         TEXT NOT NULL DEFAULT 'CLOSE',
  led_color       TEXT DEFAULT 'GREEN',
  buzzer_active   BOOLEAN DEFAULT FALSE,
  operator_id     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ALERTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id           BIGSERIAL PRIMARY KEY,
  alert_type   TEXT NOT NULL CHECK (alert_type IN ('NORMAL','PRE_WARNING','CLEAR_AREA','DANGER')),
  severity     TEXT NOT NULL CHECK (severity IN ('INFO','WARNING','CRITICAL','EMERGENCY')),
  message      TEXT NOT NULL,
  water_level  FLOAT,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type    ON alerts (alert_type, created_at DESC);

-- ─── ML PREDICTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ml_predictions (
  id               BIGSERIAL PRIMARY KEY,
  current_level    FLOAT NOT NULL,
  predicted_level  FLOAT NOT NULL,
  anomaly_score    FLOAT DEFAULT 0,
  is_anomaly       BOOLEAN DEFAULT FALSE,
  risk_level       TEXT DEFAULT 'LOW' CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  prediction_time  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EMERGENCY CONTACTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'PUBLIC' CHECK (role IN ('ADMIN','OPERATOR','PUBLIC')),
  notify_sms  BOOLEAN DEFAULT TRUE,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_control       ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- sensor_readings: public read, anon insert (ESP32)
CREATE POLICY "Public read sensor" ON sensor_readings FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "ESP32 insert sensor" ON sensor_readings FOR INSERT TO anon WITH CHECK (TRUE);

-- alerts: public read, system insert, operator ack
CREATE POLICY "Public read alerts"   ON alerts FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "System insert alerts" ON alerts FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Operator ack alerts"  ON alerts FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ml_predictions: public read, system insert
CREATE POLICY "Public read predictions"  ON ml_predictions FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "System insert prediction" ON ml_predictions FOR INSERT TO authenticated WITH CHECK (TRUE);

-- gate_control: operator only
CREATE POLICY "Operator read gate"   ON gate_control FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Operator insert gate" ON gate_control FOR INSERT TO authenticated WITH CHECK (TRUE);

-- profiles: own row
CREATE POLICY "Users read own profile"   ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- emergency_contacts: operator CRUD
CREATE POLICY "Operator read contacts"   ON emergency_contacts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Operator insert contacts" ON emergency_contacts FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Operator update contacts" ON emergency_contacts FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Operator delete contacts" ON emergency_contacts FOR DELETE TO authenticated USING (TRUE);

-- ─── TRIGGER: auto-create profile on signup ──────────────────
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── TRIGGER: auto-alert on sensor insert ────────────────────
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
    v_message    := format('DANGER: Water level at %.1f%%. Gate fully open. Evacuate immediately.', NEW.water_level);
  ELSIF NEW.water_level >= 70 THEN
    v_alert_type := 'PRE_WARNING';
    v_severity   := 'WARNING';
    v_message    := format('PRE-WARNING: Water level at %.1f%%. Gate opening 30%%.', NEW.water_level);
  ELSE
    v_alert_type := 'NORMAL';
    v_severity   := 'INFO';
    v_message    := format('NORMAL: Water level at %.1f%%.', NEW.water_level);
  END IF;

  IF v_alert_type IS DISTINCT FROM v_last_type THEN
    INSERT INTO alerts (alert_type, severity, message, water_level)
    VALUES (v_alert_type, v_severity, v_message, NEW.water_level);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_evaluate_water_level ON sensor_readings;
CREATE TRIGGER trg_evaluate_water_level
  AFTER INSERT ON sensor_readings
  FOR EACH ROW EXECUTE FUNCTION evaluate_water_level();

-- ─── SEED: sample emergency contacts ─────────────────────────
INSERT INTO emergency_contacts (name, phone, role) VALUES
  ('Dam Operator 1',        '+94XXXXXXXXX', 'OPERATOR'),
  ('Dam Operator 2',        '+94XXXXXXXXX', 'OPERATOR'),
  ('District Disaster DMC', '+94XXXXXXXXX', 'ADMIN')
ON CONFLICT (phone) DO NOTHING;

-- ─── REALTIME (enable in Supabase dashboard) ─────────────────
-- Dashboard → Database → Replication → supabase_realtime:
-- Add tables: sensor_readings, alerts, gate_control
