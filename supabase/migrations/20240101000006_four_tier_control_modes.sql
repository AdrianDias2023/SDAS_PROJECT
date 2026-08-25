-- SDAS Migration: Add 4-Tier Control Modes to gate_control and system_status

-- 1. Drop old restrictive check constraint on gate_control.mode
ALTER TABLE public.gate_control DROP CONSTRAINT IF EXISTS gate_control_mode_check;

-- 2. Add columns if not existing
ALTER TABLE public.gate_control 
  ADD COLUMN IF NOT EXISTS device_id TEXT DEFAULT 'ESP32_PUTTALAM_01',
  ADD COLUMN IF NOT EXISTS operator_email VARCHAR(255) DEFAULT 'operator@sdas.lk',
  ADD COLUMN IF NOT EXISTS action VARCHAR(64) DEFAULT 'AUTO_ADJUST';

-- 3. Add new check constraint allowing the 4 modes (+ legacy AUTO)
ALTER TABLE public.gate_control 
  ADD CONSTRAINT gate_control_mode_check 
  CHECK (mode IN ('AUTO_CLOUD', 'AUTO_OFFLINE', 'MANUAL', 'FAIL_SAFE', 'AUTO', 'EMERGENCY'));

-- 4. Create indices
CREATE INDEX IF NOT EXISTS idx_gate_control_mode ON public.gate_control(mode);
CREATE INDEX IF NOT EXISTS idx_system_status_mode ON public.system_status(operation_mode);

-- 5. Baseline test log
INSERT INTO public.gate_control (device_id, command, gate_percentage, mode, operator_email, action)
VALUES ('ESP32_PUTTALAM_01', 'INIT_4_MODES', 0, 'AUTO_CLOUD', 'system@sdas.lk', 'SYSTEM_INITIALIZED');
