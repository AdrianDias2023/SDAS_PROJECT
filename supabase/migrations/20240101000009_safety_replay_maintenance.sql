-- SDAS Migration: Disaster Events Replay, Sensor Maintenance & Cybersecurity Hardening

-- 1. Disaster Events Table for Event Replay Mode
CREATE TABLE IF NOT EXISTS public.disaster_events (
    id BIGSERIAL PRIMARY KEY,
    event_code TEXT NOT NULL UNIQUE,
    event_name TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    peak_water_level FLOAT NOT NULL,
    total_rainfall_mm FLOAT NOT NULL,
    max_gate_aperture INT NOT NULL,
    sms_broadcasts_sent INT NOT NULL,
    timeline_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Sensor Maintenance & Calibration Schedule Table
CREATE TABLE IF NOT EXISTS public.sensor_maintenance (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT NOT NULL DEFAULT 'ESP32_PUTTALAM_01',
    component_name TEXT NOT NULL,
    last_calibration_date DATE NOT NULL,
    next_calibration_due DATE NOT NULL,
    technician_name TEXT DEFAULT 'Eng. Adrian Dias',
    status TEXT NOT NULL DEFAULT 'CALIBRATED' CHECK (status IN ('CALIBRATED', 'DUE_SOON', 'OVERDUE', 'MAINTENANCE_REQUIRED')),
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Historical Disaster Scenarios for Replay Mode
INSERT INTO public.disaster_events (
    event_code, event_name, description, event_date,
    peak_water_level, total_rainfall_mm, max_gate_aperture,
    sms_broadcasts_sent, timeline_json
) VALUES (
    'EVENT_001',
    'Severe Monsoon Influx (Puttalam 2026)',
    'Rapid watershed inflow exceeding 85% reservoir threshold within 4 hours. Automated 50% controlled emergency release and 1,200 civilian advisory SMS dispatched.',
    '2026-05-18',
    92.4,
    148.5,
    50,
    1240,
    '[
      {"time": "08:00", "water_level": 58.0, "rainfall": 12.0, "gate": 0, "status": "NORMAL", "action": "Routine Monitoring"},
      {"time": "09:00", "water_level": 72.5, "rainfall": 38.0, "gate": 0, "status": "PRE_WARNING", "action": "Gate 0% Closed, Early warning SMS"},
      {"time": "10:00", "water_level": 81.0, "rainfall": 45.0, "gate": 20, "status": "CONTROLLED_RELEASE", "action": "Gate opened 20%, Downstream siren 85dB"},
      {"time": "11:00", "water_level": 92.4, "rainfall": 53.5, "gate": 50, "status": "DANGER", "action": "Gate 50% Controlled Emergency Release, SMS Alert"}
    ]'::jsonb
), (
    'EVENT_002',
    'Upstream Dam Release Surge',
    'Controlled trans-basin discharge wave without local rainfall. Hybrid AI accurately predicted peak lag 45 minutes ahead.',
    '2026-08-10',
    86.2,
    5.0,
    70,
    450,
    '[
      {"time": "14:00", "water_level": 52.0, "rainfall": 0.0, "gate": 0, "status": "NORMAL", "action": "Normal Baseline"},
      {"time": "15:00", "water_level": 68.0, "rainfall": 2.0, "gate": 0, "status": "NORMAL", "action": "LSTM Rate-of-Rise Alarm Flagged"},
      {"time": "16:00", "water_level": 86.2, "rainfall": 3.0, "gate": 70, "status": "DANGER", "action": "Gate Actuation 70%, Surge Absorbed"}
    ]'::jsonb
) ON CONFLICT (event_code) DO NOTHING;

-- Seed Sensor Maintenance Schedule
INSERT INTO public.sensor_maintenance (
    device_id, component_name, last_calibration_date, next_calibration_due, technician_name, status, notes
) VALUES 
('ESP32_PUTTALAM_01', 'JSN-SR04T Ultrasonic Sensor #1', '2026-08-01', '2026-11-01', 'Eng. Adrian Dias', 'CALIBRATED', 'Transducer cleaned, acoustic beam angle aligned to 75°'),
('ESP32_PUTTALAM_01', 'JSN-SR04T Ultrasonic Sensor #2', '2026-08-01', '2026-11-01', 'Eng. Adrian Dias', 'CALIBRATED', 'Secondary redundant transducer calibrated within ±0.2cm'),
('ESP32_PUTTALAM_01', 'DHT22 Meteorological Sensor',   '2026-07-15', '2026-10-15', 'Eng. Adrian Dias', 'CALIBRATED', 'Speed-of-sound temp compensation verified against mercury standard'),
('ESP32_PUTTALAM_01', 'MG996R Spillway Servo Actuator', '2026-08-10', '2026-11-10', 'Eng. Adrian Dias', 'CALIBRATED', 'Metal gears lubricated, 0-180° torque verified at 11 kg-cm'),
('ESP32_PUTTALAM_01', 'SIM800L Cellular GSM Module',   '2026-08-01', '2027-02-01', 'Eng. Adrian Dias', 'CALIBRATED', 'Antenna VSWR measured 1.2:1, Dialog/Mobitel SMS queue tested');

-- RLS Policies
ALTER TABLE public.disaster_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read disaster_events" ON public.disaster_events FOR SELECT USING (true);
CREATE POLICY "Public read sensor_maintenance" ON public.sensor_maintenance FOR SELECT USING (true);
CREATE POLICY "Operator manage sensor_maintenance" ON public.sensor_maintenance FOR ALL USING (true);
