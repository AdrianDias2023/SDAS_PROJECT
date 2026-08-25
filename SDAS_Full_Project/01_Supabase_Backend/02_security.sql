-- ============================================================
-- SDAS Smart Dam Alert System
-- Row Level Security Policies v2.0
-- Run this SECOND (after 01_database.sql)
-- ============================================================

-- ─── ENABLE RLS ──────────────────────────────────────────────
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_control       ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- ─── SENSOR READINGS ─────────────────────────────────────────
-- Public: anyone can read (Public App)
CREATE POLICY "Public can read sensor readings"
  ON sensor_readings FOR SELECT TO anon, authenticated USING (TRUE);

-- ESP32: can insert (using service role key in firmware)
CREATE POLICY "ESP32 device can insert readings"
  ON sensor_readings FOR INSERT TO anon
  WITH CHECK (TRUE);

-- ─── ALERTS ──────────────────────────────────────────────────
-- Public: anyone can read
CREATE POLICY "Public can read alerts"
  ON alerts FOR SELECT TO anon, authenticated USING (TRUE);

-- System: can insert alerts (via trigger/edge function)
CREATE POLICY "System can insert alerts"
  ON alerts FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Operators: can update (acknowledge alerts)
CREATE POLICY "Operators can acknowledge alerts"
  ON alerts FOR UPDATE TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ─── ML PREDICTIONS ──────────────────────────────────────────
-- Public: anyone can read predictions
CREATE POLICY "Public can read ML predictions"
  ON ml_predictions FOR SELECT TO anon, authenticated USING (TRUE);

-- System: can insert
CREATE POLICY "System can insert predictions"
  ON ml_predictions FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- ─── GATE CONTROL ────────────────────────────────────────────
-- Operators only: read
CREATE POLICY "Operators can read gate control"
  ON gate_control FOR SELECT TO authenticated USING (TRUE);

-- Operators only: insert commands
CREATE POLICY "Operators can insert gate commands"
  ON gate_control FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- ─── PROFILES ────────────────────────────────────────────────
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

-- ─── EMERGENCY CONTACTS ──────────────────────────────────────
-- Operators can read contacts (for SMS management)
CREATE POLICY "Operators can read contacts"
  ON emergency_contacts FOR SELECT TO authenticated USING (TRUE);

-- Operators can manage contacts
CREATE POLICY "Operators can insert contacts"
  ON emergency_contacts FOR INSERT TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Operators can update contacts"
  ON emergency_contacts FOR UPDATE TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Operators can delete contacts"
  ON emergency_contacts FOR DELETE TO authenticated
  USING (TRUE);
