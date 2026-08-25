-- SDAS Migration: Multi-Dam Expansion - Adding Unnichchai Dam (Batticaloa District)

-- 1. Register Unnichchai Dam Node in devices table
INSERT INTO public.devices (
    device_id,
    device_name,
    secret_key,
    location,
    is_active
) VALUES (
    'ESP32_UNNICHCHAI_02',
    'Unnichchai Spillway Node #1',
    'sdas_sec_key_unnichchai_2026',
    'Unnichchai Dam, Batticaloa District',
    true
) ON CONFLICT (device_id) DO UPDATE SET
    device_name = EXCLUDED.device_name,
    location = EXCLUDED.location,
    is_active = true;

-- 2. Seed Initial Telemetry for Unnichchai Dam
INSERT INTO public.sensor_readings (
    device_id,
    water_level,
    temperature,
    humidity,
    rainfall,
    sensor_health,
    battery_level,
    power_source,
    created_at
) VALUES (
    'ESP32_UNNICHCHAI_02',
    62.4,
    29.8,
    78.0,
    8.5,
    'NORMAL',
    96.5,
    'SOLAR_UPS_12V',
    NOW()
);

-- 3. Seed Initial System Status for Unnichchai Dam
INSERT INTO public.system_status (
    device_id,
    internet_status,
    operation_mode,
    battery_level,
    power_source,
    last_sync
) VALUES (
    'ESP32_UNNICHCHAI_02',
    'ONLINE',
    'AUTO_CLOUD',
    96.5,
    'SOLAR_UPS_12V',
    NOW()
);

-- 4. Seed Initial Gate Control State for Unnichchai Dam
INSERT INTO public.gate_control (
    gate_percentage,
    mode,
    command,
    created_at
) VALUES (
    0.0,
    'AUTO_CLOUD',
    'AUTO_HOLD',
    NOW()
);

-- 5. Seed System Health Diagnostics for Unnichchai Dam
INSERT INTO public.system_health (
    device_id,
    esp32_status,
    uptime_seconds,
    wifi_status,
    wifi_signal_dbm,
    gsm_status,
    gsm_signal_pct,
    sensor1_status,
    sensor2_status,
    dht22_status,
    battery_level,
    power_source,
    gate_servo_status,
    health_score,
    system_mode
) VALUES (
    'ESP32_UNNICHCHAI_02',
    'ONLINE',
    148200,
    'CONNECTED',
    -62,
    'READY',
    88,
    'NORMAL',
    'NORMAL',
    'NORMAL',
    96.5,
    'SOLAR_UPS_12V',
    'NORMAL',
    98,
    'AUTO_CLOUD'
);

-- 6. Seed Sensor Maintenance Record for Unnichchai Dam
INSERT INTO public.sensor_maintenance (
    device_id,
    component_name,
    last_calibration_date,
    next_calibration_due,
    technician_name,
    status,
    notes
) VALUES 
('ESP32_UNNICHCHAI_02', 'JSN-SR04T Dual Ultrasonic Transducers', '2026-08-05', '2026-11-05', 'Eng. Adrian Dias', 'CALIBRATED', 'Unnichchai spillway tower mount #2 calibrated ±0.2cm'),
('ESP32_UNNICHCHAI_02', 'DHT22 Weather Probe',                   '2026-08-05', '2026-11-05', 'Eng. Adrian Dias', 'CALIBRATED', 'Speed-of-sound temp compensation verified'),
('ESP32_UNNICHCHAI_02', 'Radial Sluice Servo Actuator',          '2026-08-05', '2026-11-05', 'Eng. Adrian Dias', 'CALIBRATED', 'Spillway gate cable winch and servo tested'),
('ESP32_UNNICHCHAI_02', 'SIM800L Dual SIM Cellular Terminal',    '2026-08-05', '2027-02-05', 'Eng. Adrian Dias', 'CALIBRATED', 'Batticaloa regional cellular signal 88%');
