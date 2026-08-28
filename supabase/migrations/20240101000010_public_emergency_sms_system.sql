-- ============================================================
-- SDAS Migration 010 — Public Emergency Alert Registration & Zone-Based SMS System
-- ============================================================

-- 1. Official Emergency Personnel Table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'OPERATOR' CHECK (role IN ('OPERATOR', 'MAINTENANCE', 'EMERGENCY_RESPONSE', 'ADMIN')),
    warning_enabled BOOLEAN DEFAULT TRUE,
    danger_enabled BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Public Alert Subscribers (Voluntary Citizen Registration)
-- Note: Zones are distance-based prototype notification sectors, not hydraulic flood inundation models.
CREATE TABLE IF NOT EXISTS public.public_alert_subscribers (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    latitude FLOAT,
    longitude FLOAT,
    area_name TEXT,
    risk_zone TEXT NOT NULL DEFAULT 'ZONE_2_INTERMEDIATE' CHECK (risk_zone IN ('ZONE_1_NEAR_DAM', 'ZONE_2_INTERMEDIATE', 'ZONE_3_EXTENDED')),
    distance_from_dam_km FLOAT,
    receive_sms BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED', 'BLOCKED')),
    verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'BLOCKED')),
    active BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_zone ON public.public_alert_subscribers (risk_zone, active);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.public_alert_subscribers (status);

-- 3. Flood Notification Zones (Prototype Simulation)
CREATE TABLE IF NOT EXISTS public.alert_zones (
    id BIGSERIAL PRIMARY KEY,
    zone_name TEXT NOT NULL UNIQUE,
    zone_priority INT NOT NULL DEFAULT 1,
    center_latitude FLOAT NOT NULL DEFAULT 8.0450,
    center_longitude FLOAT NOT NULL DEFAULT 79.8850,
    radius_km FLOAT NOT NULL,
    alert_level TEXT NOT NULL CHECK (alert_level IN ('WARNING', 'DANGER')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SMS Dispatch & Audit Logs (with Cooldown Storm Protection)
CREATE TABLE IF NOT EXISTS public.sms_dispatch_logs (
    id BIGSERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('TEST', 'PRE_WARNING', 'WARNING', 'DANGER')),
    priority TEXT NOT NULL DEFAULT 'INFO' CHECK (priority IN ('INFO', 'HIGH', 'CRITICAL')),
    target_zone TEXT,
    cooldown_key TEXT,
    recipient_count INT NOT NULL DEFAULT 0,
    performed_by TEXT NOT NULL DEFAULT 'SYSTEM',
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_logs_created ON public.sms_dispatch_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_cooldown ON public.sms_dispatch_logs (cooldown_key, created_at DESC);

-- ─── SEED OFFICIAL CONTACTS & ZONES ──────────────────────────
INSERT INTO public.emergency_contacts (name, phone_number, role, warning_enabled, danger_enabled, active) VALUES
  ('Eng. Adrian Dias (Dam Lead)', '+94771234567', 'OPERATOR', true, true, true),
  ('Puttalam Control Room',       '+94719876543', 'OPERATOR', true, true, true),
  ('Irrigation Maintenance Eng',  '+94702345678', 'MAINTENANCE', true, true, true),
  ('District Disaster DMC (117)', '+94112345678', 'EMERGENCY_RESPONSE', false, true, true),
  ('System Administrator',        '+94783456789', 'ADMIN', true, true, true)
ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.alert_zones (zone_name, zone_priority, center_latitude, center_longitude, radius_km, alert_level, active) VALUES
  ('Tabbowa Immediate Inundation Area (Zone 1)', 1, 8.0450, 79.8850, 3.0, 'DANGER', true),
  ('Kala Oya Downstream Basin (Zone 2)',         2, 8.0450, 79.8850, 8.0, 'WARNING', true),
  ('Puttalam Catchment Buffer (Zone 3)',         3, 8.0450, 79.8850, 15.0, 'WARNING', true)
ON CONFLICT (zone_name) DO NOTHING;

-- Seed Sample Subscribers for Demonstration
INSERT INTO public.public_alert_subscribers (full_name, phone_number, latitude, longitude, area_name, risk_zone, distance_from_dam_km, receive_sms, status, verification_status, active, verified_at) VALUES
  ('Sunil Perera',      '+94772221111', 8.0410, 79.8820, 'Tabbowa Colony #1', 'ZONE_1_NEAR_DAM', 0.6, true, 'VERIFIED', 'VERIFIED', true, NOW()),
  ('Kamal Fernando',    '+94773332222', 8.0320, 79.8750, 'Karambawewa Village', 'ZONE_1_NEAR_DAM', 1.8, true, 'VERIFIED', 'VERIFIED', true, NOW()),
  ('Anura Jayasinghe',  '+94774443333', 8.0680, 79.8610, 'Wanathawilluwa Road', 'ZONE_2_INTERMEDIATE', 3.6, true, 'VERIFIED', 'VERIFIED', true, NOW()),
  ('Nimal Bandara',     '+94775554444', 8.0850, 79.8450, 'Puttalam Town North', 'ZONE_2_INTERMEDIATE', 6.2, true, 'VERIFIED', 'VERIFIED', true, NOW()),
  ('Ranjith Wickrema',  '+94776665555', 8.1200, 79.8300, 'Palaviya Junction', 'ZONE_3_EXTENDED', 10.4, true, 'PENDING_VERIFICATION', 'PENDING', false, NULL)
ON CONFLICT (phone_number) DO NOTHING;

-- ─── HAVERSINE DISTANCE & REGISTRATION RPC ──────────────────
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
    lat1 FLOAT, lon1 FLOAT,
    lat2 FLOAT, lon2 FLOAT
) RETURNS FLOAT
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    r FLOAT := 6371.0; -- Earth radius in km
    dlat FLOAT;
    dlon FLOAT;
    a FLOAT;
    c FLOAT;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat / 2.0)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2.0)^2;
    c := 2.0 * asin(sqrt(a));
    RETURN ROUND((r * c)::numeric, 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.register_public_subscriber(
    p_full_name TEXT,
    p_phone_number TEXT,
    p_latitude FLOAT,
    p_longitude FLOAT,
    p_area_name TEXT,
    p_receive_sms BOOLEAN DEFAULT TRUE
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_dam_lat FLOAT := 8.0450;
    v_dam_lon FLOAT := 79.8850;
    v_dist_km FLOAT;
    v_risk_zone TEXT;
    v_new_id BIGINT;
BEGIN
    -- 1. Compute Haversine distance from Tabbowa Dam
    IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
        v_dist_km := public.calculate_distance_km(v_dam_lat, v_dam_lon, p_latitude, p_longitude);
    ELSE
        v_dist_km := 4.5; -- Default prototype fallback
    END IF;

    -- 2. Assign Prototype Distance-Based Notification Zone
    IF v_dist_km <= 3.0 THEN
        v_risk_zone := 'ZONE_1_NEAR_DAM';
    ELSIF v_dist_km <= 8.0 THEN
        v_risk_zone := 'ZONE_2_INTERMEDIATE';
    ELSE
        v_risk_zone := 'ZONE_3_EXTENDED';
    END IF;

    -- 3. Insert or Update Subscriber (Initial state: PENDING_VERIFICATION, active=false)
    INSERT INTO public.public_alert_subscribers (
        full_name, phone_number, latitude, longitude, area_name,
        risk_zone, distance_from_dam_km, receive_sms,
        status, verification_status, active
    ) VALUES (
        p_full_name, p_phone_number, p_latitude, p_longitude, p_area_name,
        v_risk_zone, v_dist_km, p_receive_sms,
        'PENDING_VERIFICATION', 'PENDING', FALSE
    )
    ON CONFLICT (phone_number) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        area_name = EXCLUDED.area_name,
        risk_zone = EXCLUDED.risk_zone,
        distance_from_dam_km = EXCLUDED.distance_from_dam_km,
        receive_sms = EXCLUDED.receive_sms
    RETURNING id INTO v_new_id;

    -- 4. Record Audit Log
    INSERT INTO public.sms_dispatch_logs (
        action, alert_type, priority, target_zone, recipient_count, performed_by, message_body, status, details
    ) VALUES (
        'SUBSCRIBER_REGISTERED', 'PRE_WARNING', 'INFO', v_risk_zone, 1, 'CITIZEN',
        format('Citizen %s registered for %s (dist: %.1f km). Pending verification.', p_full_name, v_risk_zone, v_dist_km),
        'SENT',
        jsonb_build_object('phone', p_phone_number, 'distance_km', v_dist_km, 'zone', v_risk_zone)
    );

    RETURN jsonb_build_object(
        'success', true,
        'subscriber_id', v_new_id,
        'risk_zone', v_risk_zone,
        'distance_km', v_dist_km,
        'status', 'PENDING_VERIFICATION',
        'message', 'Registration submitted successfully. Pending operator verification.'
    );
END;
$$;

-- ─── RLS POLICIES ────────────────────────────────────────────
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_alert_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_dispatch_logs ENABLE ROW LEVEL SECURITY;

-- emergency_contacts
CREATE POLICY "Public read emergency_contacts"
    ON public.emergency_contacts FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "Operators manage emergency_contacts"
    ON public.emergency_contacts FOR ALL TO authenticated
    USING (public.is_operator_or_admin())
    WITH CHECK (public.is_operator_or_admin());

-- public_alert_subscribers
CREATE POLICY "Public can submit subscriber registration"
    ON public.public_alert_subscribers FOR INSERT TO anon, authenticated
    WITH CHECK (status = 'PENDING_VERIFICATION' AND active = FALSE);

CREATE POLICY "Operators can read all subscribers"
    ON public.public_alert_subscribers FOR SELECT TO authenticated
    USING (public.is_operator_or_admin());

CREATE POLICY "Operators can update subscribers"
    ON public.public_alert_subscribers FOR UPDATE TO authenticated
    USING (public.is_operator_or_admin())
    WITH CHECK (public.is_operator_or_admin());

CREATE POLICY "Operators can delete subscribers"
    ON public.public_alert_subscribers FOR DELETE TO authenticated
    USING (public.is_operator_or_admin());

-- alert_zones
CREATE POLICY "Public read alert_zones"
    ON public.alert_zones FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "Operators manage alert_zones"
    ON public.alert_zones FOR ALL TO authenticated
    USING (public.is_operator_or_admin())
    WITH CHECK (public.is_operator_or_admin());

-- sms_dispatch_logs
CREATE POLICY "Public read sms_dispatch_logs"
    ON public.sms_dispatch_logs FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "Operators insert sms_dispatch_logs"
    ON public.sms_dispatch_logs FOR INSERT TO authenticated
    WITH CHECK (public.is_operator_or_admin());
