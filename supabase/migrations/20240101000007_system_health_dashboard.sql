-- SDAS Migration: Add system_health heartbeat and diagnostic telemetry table

CREATE TABLE IF NOT EXISTS public.system_health (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT NOT NULL DEFAULT 'ESP32_PUTTALAM_01',
    esp32_status TEXT NOT NULL DEFAULT 'ONLINE',
    uptime_seconds BIGINT DEFAULT 0,
    wifi_status TEXT NOT NULL DEFAULT 'CONNECTED',
    wifi_signal_dbm INT DEFAULT -65,
    gsm_status TEXT NOT NULL DEFAULT 'CONNECTED',
    gsm_signal_pct INT DEFAULT 85,
    sensor1_status TEXT NOT NULL DEFAULT 'NORMAL',
    sensor1_distance_cm FLOAT DEFAULT 25.0,
    sensor2_status TEXT NOT NULL DEFAULT 'NORMAL',
    sensor2_distance_cm FLOAT DEFAULT 25.2,
    dht22_status TEXT NOT NULL DEFAULT 'NORMAL',
    battery_level FLOAT DEFAULT 85.0,
    power_source TEXT DEFAULT 'MAINS_12V',
    gate_servo_status TEXT DEFAULT 'OPERATIONAL',
    gate_motor_cycles INT DEFAULT 54,
    ai_lstm_status TEXT DEFAULT 'ACTIVE',
    ai_autoencoder_status TEXT DEFAULT 'MONITORING',
    health_score INT DEFAULT 96, -- 0 to 100 weighted score
    system_mode TEXT DEFAULT 'AUTO_CLOUD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_health_created ON public.system_health (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_device ON public.system_health (device_id, created_at DESC);

-- Baseline diagnostic heartbeat entry
INSERT INTO public.system_health (
    device_id, esp32_status, uptime_seconds, wifi_status, wifi_signal_dbm,
    gsm_status, gsm_signal_pct, sensor1_status, sensor1_distance_cm,
    sensor2_status, sensor2_distance_cm, dht22_status, battery_level,
    power_source, gate_servo_status, gate_motor_cycles, ai_lstm_status,
    ai_autoencoder_status, health_score, system_mode
) VALUES (
    'ESP32_PUTTALAM_01', 'ONLINE', 129600, 'CONNECTED', -64,
    'CONNECTED', 88, 'NORMAL', 24.8,
    'NORMAL', 25.1, 'NORMAL', 92.0,
    'MAINS_12V', 'OPERATIONAL', 58, 'ACTIVE',
    'MONITORING', 98, 'AUTO_CLOUD'
);

-- RLS Policies
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read system_health"
ON public.system_health FOR SELECT
USING (true);

CREATE POLICY "Allow device & operator update system_health"
ON public.system_health FOR ALL
USING (true);
