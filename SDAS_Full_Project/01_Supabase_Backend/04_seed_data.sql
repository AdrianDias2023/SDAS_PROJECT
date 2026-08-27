-- ============================================================
-- SDAS Smart Dam Alert System
-- Initial Demonstration Seed Data v2.0
-- Target Model: Tabbowa Prototype Dam (Puttalam District)
-- Run this FOURTH (Optional: for initial demo state)
-- ============================================================

-- ─── SEED SENSOR TELEMETRY ───────────────────────────────────
INSERT INTO sensor_readings (device_id, water_level, temperature, humidity, sensor_health)
VALUES
  ('ESP32_PUTTALAM_01', 72.5, 28.4, 74.0, 'NORMAL'),
  ('ESP32_PUTTALAM_01', 73.1, 28.2, 75.0, 'NORMAL'),
  ('ESP32_PUTTALAM_01', 74.0, 27.9, 76.5, 'NORMAL');

-- ─── SEED GATE POSITION (Closed 0°) ──────────────────────────
INSERT INTO gate_control (gate_percentage, mode, command, led_color, buzzer_active)
VALUES (0, 'AUTO', 'NORMAL_CLOSED_0', 'GREEN', FALSE);

-- ─── SEED COMMUNITY SITUATION REPORTS ────────────────────────
INSERT INTO community_reports (latitude, longitude, location_name, category, description, confirmation_count, status, distance_from_dam_km)
VALUES
  (8.0362, 79.8283, 'Tabbowa Dam Spillway & Causeway', 'WATER_RISING', 'Water level rose 1.5 feet across the low-level causeway during the afternoon downpour.', 18, 'APPROVED', 0.4),
  (8.0410, 79.8620, 'Puttalam-Anuradhapura Highway (A12)', 'ROAD_FLOODED', 'Minor water sheet overtopping near km post 14. Small vehicles should exercise caution.', 12, 'APPROVED', 1.8),
  (8.0195, 79.8512, 'Karuwalagaswewa Village Sector', 'HEAVY_RAIN', 'Continuous monsoon downpour for 45 minutes. Inflow drainage channels flowing at capacity.', 7, 'APPROVED', 2.1);

-- ─── SEED EMERGENCY CONTACTS ─────────────────────────────────
INSERT INTO emergency_contacts (name, phone, role, priority)
VALUES
  ('Disaster Management Centre (DMC) Hotline', '117', 'DMC_HOTLINE', 1),
  ('Irrigation Department Puttalam Division', '0322265224', 'OFFICER', 2),
  ('Puttalam Divisional Secretariat', '0322265236', 'COMMUNITY_LEADER', 3),
  ('Karuwalagaswewa Police Station', '0322269222', 'POLICE', 4),
  ('Puttalam Base Hospital Emergency', '0322265261', 'HOSPITAL', 5);
