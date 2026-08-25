-- SDAS Migration: Multi-Dam Profiles, Audit Logs, and System Benchmarks

-- 1. Multi-Dam Disaster Location Management
CREATE TABLE IF NOT EXISTS public.dams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dam_code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    district VARCHAR(64) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    capacity_million_m3 NUMERIC(8, 2) NOT NULL,
    full_supply_level_m NUMERIC(6, 2) NOT NULL,
    warning_threshold_pct NUMERIC(5, 2) DEFAULT 70.0,
    danger_threshold_pct NUMERIC(5, 2) DEFAULT 85.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert primary Sri Lankan reservoir profiles
INSERT INTO public.dams (dam_code, name, district, latitude, longitude, capacity_million_m3, full_supply_level_m, warning_threshold_pct, danger_threshold_pct)
VALUES 
    ('TABBOWA_01', 'Tabbowa Reservoir Dam', 'Puttalam', 8.0362, 79.8283, 14.80, 8.50, 70.0, 85.0),
    ('RAJANGANA_01', 'Rajangana Reservoir Dam', 'Anuradhapura/Puttalam', 8.3583, 80.2000, 100.30, 29.50, 75.0, 88.0),
    ('DEDURU_01', 'Deduru Oya Reservoir Dam', 'Kurunegala/Puttalam', 7.7167, 80.2667, 75.00, 22.00, 70.0, 85.0)
ON CONFLICT (dam_code) DO NOTHING;

-- 2. Operator Role Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_email VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial audit entry
INSERT INTO public.audit_logs (operator_email, action, details)
VALUES ('operator@sdas.lk', 'SYSTEM_INITIALIZED', '{"message": "SDAS system initialized with audit logging enabled"}'::jsonb);

-- 3. System Testing & Benchmarks Results Table
CREATE TABLE IF NOT EXISTS public.system_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_type VARCHAR(64) NOT NULL,
    metric_name VARCHAR(64) NOT NULL,
    target_value VARCHAR(32) NOT NULL,
    achieved_value VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    tested_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.dams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read dams" ON public.dams FOR SELECT USING (is_active = true);
CREATE POLICY "Public read benchmarks" ON public.system_benchmarks FOR SELECT USING (true);
CREATE POLICY "Authenticated operators view audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Authenticated operators insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
