-- SDAS Migration: Add Devices Security Table, Device Auth, and Battery Monitoring

-- 1. Devices Authentication Table
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(64) UNIQUE NOT NULL,
    device_name VARCHAR(128) NOT NULL,
    secret_key VARCHAR(128) NOT NULL,
    location VARCHAR(128) DEFAULT 'Tabbowa Reservoir, Puttalam',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Register primary Puttalam Dam ESP32 Node
INSERT INTO public.devices (device_id, device_name, secret_key, location, is_active)
VALUES ('ESP32_PUTTALAM_01', 'Primary Spillway Node', 'sdas_sec_key_puttalam_2026', 'Tabbowa Dam, Puttalam', true)
ON CONFLICT (device_id) DO NOTHING;

-- 2. Add battery_level to sensor_readings if not exists
ALTER TABLE public.sensor_readings 
ADD COLUMN IF NOT EXISTS battery_level NUMERIC(5, 2) DEFAULT 100.0,
ADD COLUMN IF NOT EXISTS power_source VARCHAR(32) DEFAULT 'MAINS_12V';

-- 3. Row-Level Security for Devices
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active devices"
ON public.devices FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins manage devices"
ON public.devices FOR ALL
USING (auth.role() = 'authenticated');
