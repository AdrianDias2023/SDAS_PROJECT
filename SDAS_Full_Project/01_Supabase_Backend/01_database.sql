-- ============================================================
-- SDAS Smart Dam Alert System — Database Schema v2.0
-- Target Model: Tabbowa Prototype Dam (Puttalam District)
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PROFILES (User & Operator Accounts) ─────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'PUBLIC' CHECK (role IN ('OPERATOR', 'ADMIN', 'PUBLIC')),
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SENSOR READINGS (ESP32 Telemetry) ───────────────────────
CREATE TABLE IF NOT EXISTS sensor_readings (
  id            BIGSERIAL PRIMARY KEY,
  device_id     TEXT NOT NULL DEFAULT 'ESP32_PUTTALAM_01',
  water_level   NUMERIC(5, 2) NOT NULL CHECK (water_level >= 0 AND water_level <= 100),
  temperature   NUMERIC(4, 1) NOT NULL,
  humidity      NUMERIC(4, 1) NOT NULL,
  sensor_health TEXT NOT NULL DEFAULT 'NORMAL' CHECK (sensor_health IN ('NORMAL', 'DEGRADED', 'FAULT', 'FAILOVER')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_created ON sensor_readings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device  ON sensor_readings (device_id, created_at DESC);

-- ─── GATE CONTROL (Actuator Commands) ─────────────────────────
-- Allowed canonical operational positions: 0% (Closed), 20% (Controlled), 50% (Emergency)
CREATE TABLE IF NOT EXISTS gate_control (
  id              BIGSERIAL PRIMARY KEY,
  gate_percentage INTEGER NOT NULL CHECK (gate_percentage >= 0 AND gate_percentage <= 100),
  mode            TEXT NOT NULL DEFAULT 'AUTO' CHECK (mode IN ('AUTO', 'MANUAL', 'MANUAL_OVERRIDE', 'AUTO_AI')),
  command         TEXT NOT NULL,
  led_color       TEXT NOT NULL DEFAULT 'GREEN' CHECK (led_color IN ('GREEN', 'YELLOW', 'AMBER', 'RED')),
  buzzer_active   BOOLEAN NOT NULL DEFAULT FALSE,
  operator_id     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gate_control_created ON gate_control (created_at DESC);

-- ─── ALERTS (System & Early Warnings) ─────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          BIGSERIAL PRIMARY KEY,
  alert_type  TEXT NOT NULL CHECK (alert_type IN ('NORMAL', 'PRE_WARNING', 'WARNING', 'DANGER')),
  severity    TEXT NOT NULL CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'WARNING', 'HIGH', 'CRITICAL', 'EMERGENCY')),
  message     TEXT NOT NULL,
  water_level NUMERIC(5, 2) NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unack   ON alerts (acknowledged, created_at DESC);

-- ─── ML PREDICTIONS (FastAPI AI Inference) ────────────────────
CREATE TABLE IF NOT EXISTS ml_predictions (
  id                    BIGSERIAL PRIMARY KEY,
  risk_level            TEXT NOT NULL CHECK (risk_level IN ('NORMAL', 'PRE_WARNING', 'WARNING', 'DANGER')),
  predicted_level_1h    NUMERIC(5, 2),
  predicted_level_3h    NUMERIC(5, 2),
  predicted_level_6h    NUMERIC(5, 2),
  confidence_score      NUMERIC(4, 3) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  anomaly_detected      BOOLEAN NOT NULL DEFAULT FALSE,
  reconstruction_error  NUMERIC(7, 5),
  model_version         TEXT NOT NULL DEFAULT 'v2.0-rf-lstm-autoenc',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_created ON ml_predictions (created_at DESC);

-- ─── EMERGENCY CONTACTS (SMS Alert Directory) ─────────────────
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  phone_number    TEXT NOT NULL UNIQUE,
  role            TEXT NOT NULL DEFAULT 'OPERATOR' CHECK (role IN ('OPERATOR', 'MAINTENANCE', 'EMERGENCY_RESPONSE', 'ADMIN')),
  warning_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  danger_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id)
);

-- ─── PUBLIC ALERT SUBSCRIBERS (Citizen Registration) ──────────
-- Note: Zones are distance-based prototype notification sectors, not hydraulic flood inundation models.
CREATE TABLE IF NOT EXISTS public_alert_subscribers (
  id                   BIGSERIAL PRIMARY KEY,
  full_name            TEXT NOT NULL,
  phone_number         TEXT NOT NULL UNIQUE,
  latitude             FLOAT,
  longitude            FLOAT,
  area_name            TEXT,
  risk_zone            TEXT NOT NULL DEFAULT 'ZONE_2_INTERMEDIATE' CHECK (risk_zone IN ('ZONE_1_NEAR_DAM', 'ZONE_2_INTERMEDIATE', 'ZONE_3_EXTENDED')),
  distance_from_dam_km FLOAT,
  receive_sms          BOOLEAN NOT NULL DEFAULT TRUE,
  status               TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED', 'BLOCKED')),
  verification_status  TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'BLOCKED')),
  active               BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at          TIMESTAMPTZ,
  verified_by          UUID REFERENCES profiles(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_zone ON public_alert_subscribers (risk_zone, active);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public_alert_subscribers (status);

-- ─── FLOOD NOTIFICATION ZONES (Prototype Simulation) ───────────
CREATE TABLE IF NOT EXISTS alert_zones (
  id               BIGSERIAL PRIMARY KEY,
  zone_name        TEXT NOT NULL UNIQUE,
  zone_priority    INT NOT NULL DEFAULT 1,
  center_latitude  FLOAT NOT NULL DEFAULT 8.0450,
  center_longitude FLOAT NOT NULL DEFAULT 79.8850,
  radius_km        FLOAT NOT NULL,
  alert_level      TEXT NOT NULL CHECK (alert_level IN ('WARNING', 'DANGER')),
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SMS DISPATCH & AUDIT LOGS (with Cooldown Storm Protection) ──
CREATE TABLE IF NOT EXISTS sms_dispatch_logs (
  id              BIGSERIAL PRIMARY KEY,
  action          TEXT NOT NULL,
  alert_type      TEXT NOT NULL CHECK (alert_type IN ('TEST', 'PRE_WARNING', 'WARNING', 'DANGER')),
  priority        TEXT NOT NULL DEFAULT 'INFO' CHECK (priority IN ('INFO', 'HIGH', 'CRITICAL')),
  target_zone     TEXT,
  cooldown_key    TEXT,
  recipient_count INT NOT NULL DEFAULT 0,
  performed_by    TEXT NOT NULL DEFAULT 'SYSTEM',
  message_body    TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
  details         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_logs_created ON sms_dispatch_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_cooldown ON sms_dispatch_logs (cooldown_key, created_at DESC);

-- ─── TRIGGER: Auto-create profile on user signup ─────────────
-- Defaults all signups to 'PUBLIC' to prevent unauthorized role escalation.
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
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, 'Citizen'), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'PUBLIC')
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        updated_at = NOW();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── COMMUNITY REPORTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_reports (
  id                   BIGSERIAL PRIMARY KEY,
  user_id              UUID REFERENCES profiles(id),
  latitude             FLOAT NOT NULL DEFAULT 8.0362,
  longitude            FLOAT NOT NULL DEFAULT 79.8283,
  location_name        TEXT NOT NULL,
  category             TEXT NOT NULL CHECK (category IN ('WATER_RISING', 'HEAVY_RAIN', 'ROAD_FLOODED', 'WATER_ENTERING', 'OTHER')),
  description          TEXT NOT NULL,
  image_url            TEXT,
  confirmation_count   INTEGER NOT NULL DEFAULT 1,
  status               TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED')),
  operator_note        TEXT,
  distance_from_dam_km FLOAT DEFAULT 2.4,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_created ON community_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_status  ON community_reports (status, created_at DESC);

-- ─── COMMUNITY REPORT CONFIRMATIONS (Anti-Spam Persistence) ─
CREATE TABLE IF NOT EXISTS community_report_confirmations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id        BIGINT NOT NULL REFERENCES community_reports(id) ON DELETE CASCADE,
  user_identifier  TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(report_id, user_identifier)
);

CREATE INDEX IF NOT EXISTS idx_confirmations_report ON community_report_confirmations (report_id);

-- ─── WEATHER METEOROLOGICAL TELEMETRY ─────────────────────────
CREATE TABLE IF NOT EXISTS weather_data (
  id             BIGSERIAL PRIMARY KEY,
  location       TEXT NOT NULL DEFAULT 'Puttalam District',
  latitude       FLOAT NOT NULL DEFAULT 8.0362,
  longitude      FLOAT NOT NULL DEFAULT 79.8283,
  temperature    NUMERIC(4, 1) NOT NULL,
  humidity       NUMERIC(4, 1) NOT NULL,
  rainfall       NUMERIC(5, 1) NOT NULL,
  wind_speed     NUMERIC(4, 1) NOT NULL,
  forecast_time  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_created ON weather_data (created_at DESC);
