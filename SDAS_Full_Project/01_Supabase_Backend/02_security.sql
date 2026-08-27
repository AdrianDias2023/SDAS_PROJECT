-- ============================================================
-- SDAS Smart Dam Alert System
-- Row Level Security (RLS) Policies v2.0
-- Run this SECOND (after 01_database.sql)
-- ============================================================

-- ─── HELPER FUNCTION: ROLE-BASED ACCESS CONTROL (RBAC) ───────
CREATE OR REPLACE FUNCTION public.is_operator_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('OPERATOR', 'ADMIN')
  );
$$;

-- ─── ENABLE RLS ON ALL TABLES ────────────────────────────────
ALTER TABLE profiles                          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_control                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts                            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_report_confirmations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data                      ENABLE ROW LEVEL SECURITY;

-- ─── SENSOR READINGS ─────────────────────────────────────────
CREATE POLICY "Public can read sensor readings"
  ON sensor_readings FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "ESP32 device can insert readings"
  ON sensor_readings FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- ─── ALERTS ──────────────────────────────────────────────────
CREATE POLICY "Public can read alerts"
  ON alerts FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "System can insert alerts"
  ON alerts FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Operators only: can acknowledge alerts
CREATE POLICY "Operators can acknowledge alerts"
  ON alerts FOR UPDATE TO authenticated
  USING (public.is_operator_or_admin())
  WITH CHECK (public.is_operator_or_admin());

-- ─── ML PREDICTIONS ──────────────────────────────────────────
CREATE POLICY "Public can read ML predictions"
  ON ml_predictions FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "System can insert predictions"
  ON ml_predictions FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- ─── GATE CONTROL ────────────────────────────────────────────
CREATE POLICY "Public can read gate status"
  ON gate_control FOR SELECT TO anon, authenticated USING (TRUE);

-- Strict RBAC: Only certified operators and admins can insert actuator commands
CREATE POLICY "Operators can insert gate commands"
  ON gate_control FOR INSERT TO authenticated
  WITH CHECK (public.is_operator_or_admin());

-- ─── COMMUNITY REPORTS ───────────────────────────────────────
-- 1. Public can read approved and community reports
CREATE POLICY "Public can read community reports"
  ON community_reports FOR SELECT TO anon, authenticated
  USING (TRUE);

-- 2. Public can submit new reports (must have PENDING_REVIEW status)
CREATE POLICY "Public can submit community reports"
  ON community_reports FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'PENDING_REVIEW');

-- 3. Strict RBAC: Only verified operators can update/moderate reports
CREATE POLICY "Operators can moderate community reports"
  ON community_reports FOR UPDATE TO authenticated
  USING (public.is_operator_or_admin())
  WITH CHECK (public.is_operator_or_admin());

-- 4. Strict RBAC: Only operators/admins can delete fraudulent reports
CREATE POLICY "Operators can delete community reports"
  ON community_reports FOR DELETE TO authenticated
  USING (public.is_operator_or_admin());

-- ─── COMMUNITY CONFIRMATIONS ─────────────────────────────────
CREATE POLICY "Public can read confirmations"
  ON community_report_confirmations FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Public can submit report confirmation"
  ON community_report_confirmations FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- ─── WEATHER DATA ────────────────────────────────────────────
CREATE POLICY "Public can read weather data"
  ON weather_data FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "System can insert weather data"
  ON weather_data FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

-- ─── PROFILES ────────────────────────────────────────────────
CREATE POLICY "Allow profile insert"
  ON profiles FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (public.is_operator_or_admin());

-- ─── EMERGENCY CONTACTS ──────────────────────────────────────
CREATE POLICY "Public can read contacts"
  ON emergency_contacts FOR SELECT TO anon, authenticated USING (TRUE);

-- Operators only: can manage contacts
CREATE POLICY "Operators can insert contacts"
  ON emergency_contacts FOR INSERT TO authenticated
  WITH CHECK (public.is_operator_or_admin());

CREATE POLICY "Operators can update contacts"
  ON emergency_contacts FOR UPDATE TO authenticated
  USING (public.is_operator_or_admin()) WITH CHECK (public.is_operator_or_admin());

CREATE POLICY "Operators can delete contacts"
  ON emergency_contacts FOR DELETE TO authenticated
  USING (public.is_operator_or_admin());
