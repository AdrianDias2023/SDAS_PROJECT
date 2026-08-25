-- SDAS Migration: Add system_status table for Offline Emergency and Operating Mode Tracking

CREATE TABLE IF NOT EXISTS public.system_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(64) NOT NULL,
    internet_status VARCHAR(16) NOT NULL DEFAULT 'ONLINE', -- 'ONLINE' | 'OFFLINE'
    operation_mode VARCHAR(32) NOT NULL DEFAULT 'CLOUD_AUTO', -- 'CLOUD_AUTO' | 'OFFLINE_EMERGENCY' | 'MANUAL_OVERRIDE'
    battery_level NUMERIC(5, 2) DEFAULT 100.0,
    power_source VARCHAR(32) DEFAULT 'MAINS_12V',
    last_sync TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert baseline status entry
INSERT INTO public.system_status (device_id, internet_status, operation_mode, battery_level, power_source)
VALUES ('ESP32_PUTTALAM_01', 'ONLINE', 'CLOUD_AUTO', 100.0, 'MAINS_12V');

-- RLS Policies
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read system status"
ON public.system_status FOR SELECT
USING (true);

CREATE POLICY "Allow device & operator update system status"
ON public.system_status FOR ALL
USING (true);
