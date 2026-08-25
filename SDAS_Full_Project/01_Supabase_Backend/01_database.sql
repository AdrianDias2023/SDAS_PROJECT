-- ============================================================
-- SDAS Smart Dam Alert System
-- Database Schema v2.0
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- ─── PROFILES (Operators) ────────────────────────────────────
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
  sensor1_level  FLOAT,   -- Raw reading from JSN-SR04T #1
  sensor2_level  FLOAT,   -- Raw reading from JSN-SR04T #2
  sensor_health  TEXT NOT NULL DEFAULT 'NORMAL'
                   CHECK (sensor_health IN ('NORMAL','SENSOR1_FAULT','SENSOR2_FAULT','SENSOR_MISMATCH','DUAL_FAULT')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast latest-reading queries
CREATE INDEX IF NOT EXISTS idx_sensor_readings_created ON sensor_readings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device  ON sensor_readings (device_id, created_at DESC);

-- ─── GATE CONTROL ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gate_control (
  id             BIGSERIAL PRIMARY KEY,
  gate_percentage FLOAT NOT NULL DEFAULT 0 CHECK (gate_percentage >= 0 AND gate_percentage <= 100),
  mode           TEXT NOT NULL DEFAULT 'AUTO' CHECK (mode IN ('AUTO','MANUAL')),
  command        TEXT NOT NULL DEFAULT 'CLOSE',
  led_color      TEXT DEFAULT 'GREEN',
  buzzer_active  BOOLEAN DEFAULT FALSE,
  operator_id    UUID REFERENCES profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ALERTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          BIGSERIAL PRIMARY KEY,
  alert_type  TEXT NOT NULL CHECK (alert_type IN ('NORMAL','PRE_WARNING','CONTROLLED_RELEASE','DANGER')),
  severity    TEXT NOT NULL CHECK (severity IN ('INFO','WARNING','CRITICAL','EMERGENCY')),
  message     TEXT NOT NULL,
  water_level FLOAT,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_created  ON alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type     ON alerts (alert_type, created_at DESC);

-- ─── ML PREDICTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ml_predictions (
  id               BIGSERIAL PRIMARY KEY,
  current_level    FLOAT NOT NULL,
  predicted_level  FLOAT NOT NULL,   -- 1-hour ahead LSTM prediction
  anomaly_score    FLOAT DEFAULT 0,  -- Autoencoder MSE
  is_anomaly       BOOLEAN DEFAULT FALSE,
  risk_level       TEXT DEFAULT 'LOW' CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  prediction_time  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EMERGENCY CONTACTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'PUBLIC' CHECK (role IN ('ADMIN','OPERATOR','PUBLIC')),
  notify_sms  BOOLEAN DEFAULT TRUE,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert sample contacts (replace with real numbers)
INSERT INTO emergency_contacts (name, phone, role) VALUES
  ('Dam Operator 1',        '+94XXXXXXXXX', 'OPERATOR'),
  ('Dam Operator 2',        '+94XXXXXXXXX', 'OPERATOR'),
  ('District Disaster DMC', '+94XXXXXXXXX', 'ADMIN')
ON CONFLICT (phone) DO NOTHING;

-- ─── TRIGGER: Auto-create profile on user signup ─────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, 'Operator'), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'OPERATOR')
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        role = EXCLUDED.role;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fallback to ensure auth user creation never gets blocked
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── ENABLE REALTIME ─────────────────────────────────────────
-- Run these in Supabase Dashboard → Database → Replication
-- Or uncomment and run:
-- ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;
-- ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE gate_control;
