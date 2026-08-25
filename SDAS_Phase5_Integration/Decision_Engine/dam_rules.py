"""
SDAS — Complete Decision Engine v2.0
4-level alert system with 3% hysteresis and ML advisory integration.

Matches the proposal table exactly:
  NORMAL      < 70%              Gate closed    Green   No SMS
  PRE-WARNING 70-85% stable      Gate 30%       Yellow  Pre-warning SMS
  CLEAR-AREA  70-85% rising      Gate 70%       Orange  Clear area SMS
  DANGER      > 85%              Gate 100%      Red     Emergency SMS + Buzzer
"""

from dataclasses import dataclass
from typing import Optional

# ── Thresholds ─────────────────────────────────────────────────
THRESH_NORMAL  = 70.0
THRESH_DANGER  = 85.0
HYSTERESIS     = 3.0
RISE_THRESHOLD = 0.3   # % per reading to trigger CLEAR-AREA

# ── Alert levels ───────────────────────────────────────────────
LEVELS = {
    'NORMAL':      0,
    'PRE_WARNING': 1,
    'CLEAR_AREA':  2,
    'DANGER':      3,
}

# Reverse lookup
LEVEL_NAMES = {v: k for k, v in LEVELS.items()}


@dataclass
class DamDecision:
    status:        str    # NORMAL | PRE_WARNING | CLEAR_AREA | DANGER
    gate_pct:      float  # 0, 30, 70, 100
    gate_angle:    int    # Servo angle: 0, 54, 126, 180
    led_color:     str    # GREEN | YELLOW | ORANGE | RED
    sms_required:  bool
    sms_type:      str    # '' | 'PRE_WARNING' | 'CLEAR_AREA' | 'EMERGENCY'
    buzzer:        bool
    ml_advisory:   Optional[str]  # advisory note from ML


def evaluate(
    water_level_pct:  float,
    previous_level:   float          = 0.0,
    current_status:   str            = 'NORMAL',
    ml_prediction:    Optional[float]= None,   # LSTM 1-hour ahead (advisory only)
    is_anomaly:       bool           = False,
) -> DamDecision:
    """
    Evaluate water level and return a DamDecision.

    Args:
      water_level_pct:  Current water level (0–100%)
      previous_level:   Previous water level reading (for rate-of-rise)
      current_status:   Current alert status (for hysteresis)
      ml_prediction:    Optional LSTM 1-hour ahead prediction (advisory)
      is_anomaly:       Autoencoder anomaly flag (advisory)

    Returns:
      DamDecision with all actuator commands
    """
    rise_rate     = water_level_pct - previous_level
    current_level = LEVELS.get(current_status, 0)

    # ── Determine new alert level ──────────────────────────────
    if water_level_pct >= THRESH_DANGER:
        new_level = LEVELS['DANGER']

    elif water_level_pct >= THRESH_NORMAL:
        # Rising fast → CLEAR-AREA
        if rise_rate >= RISE_THRESHOLD:
            new_level = LEVELS['CLEAR_AREA']
        elif current_level >= LEVELS['CLEAR_AREA']:
            # Stay at CLEAR-AREA until hysteresis threshold passed
            new_level = LEVELS['CLEAR_AREA']
        else:
            new_level = LEVELS['PRE_WARNING']

    else:
        # ── Hysteresis: stepping DOWN ──────────────────────────
        if current_level == LEVELS['DANGER']:
            new_level = LEVELS['DANGER'] if water_level_pct >= THRESH_DANGER - HYSTERESIS else LEVELS['CLEAR_AREA']
        elif current_level == LEVELS['CLEAR_AREA']:
            new_level = LEVELS['NORMAL'] if water_level_pct < THRESH_NORMAL - HYSTERESIS else LEVELS['CLEAR_AREA']
        elif current_level == LEVELS['PRE_WARNING']:
            new_level = LEVELS['NORMAL'] if water_level_pct < THRESH_NORMAL - HYSTERESIS else LEVELS['PRE_WARNING']
        else:
            new_level = LEVELS['NORMAL']

    status = LEVEL_NAMES[new_level]

    # ── Gate position ──────────────────────────────────────────
    gate_map = {
        'NORMAL':      (0.0,  0),
        'PRE_WARNING': (30.0, 54),
        'CLEAR_AREA':  (70.0, 126),
        'DANGER':      (100.0, 180),
    }
    gate_pct, gate_angle = gate_map[status]

    # ── LED colour ─────────────────────────────────────────────
    led_map = {
        'NORMAL':      'GREEN',
        'PRE_WARNING': 'YELLOW',
        'CLEAR_AREA':  'ORANGE',
        'DANGER':      'RED',
    }
    led_color = led_map[status]

    # ── SMS ────────────────────────────────────────────────────
    sms_type_map = {
        'NORMAL':      ('',           False),
        'PRE_WARNING': ('PRE_WARNING',True),
        'CLEAR_AREA':  ('CLEAR_AREA', True),
        'DANGER':      ('EMERGENCY',  True),
    }
    sms_type, sms_required = sms_type_map[status]

    # ── Buzzer ─────────────────────────────────────────────────
    buzzer = (status == 'DANGER')

    # ── ML advisory note ──────────────────────────────────────
    ml_advisory = None
    if ml_prediction is not None:
        if ml_prediction >= THRESH_DANGER:
            ml_advisory = f"LSTM predicts DANGER level ({ml_prediction:.1f}%) in 1 hour — escalation likely"
        elif ml_prediction >= THRESH_NORMAL:
            ml_advisory = f"LSTM predicts elevated level ({ml_prediction:.1f}%) in 1 hour — monitor closely"
        else:
            ml_advisory = f"LSTM predicts normal level ({ml_prediction:.1f}%) in 1 hour"

    if is_anomaly:
        ml_advisory = (ml_advisory or '') + " | ⚠️ SENSOR ANOMALY DETECTED — readings may be unreliable"

    return DamDecision(
        status       = status,
        gate_pct     = gate_pct,
        gate_angle   = gate_angle,
        led_color    = led_color,
        sms_required = sms_required,
        sms_type     = sms_type,
        buzzer       = buzzer,
        ml_advisory  = ml_advisory,
    )


# ── Quick test ─────────────────────────────────────────────────
if __name__ == '__main__':
    test_cases = [
        (40, 39, 'NORMAL',      None,  False),
        (72, 71, 'NORMAL',      None,  False),
        (78, 75, 'PRE_WARNING', 80.0,  False),
        (80, 78, 'PRE_WARNING', 87.0,  True),   # Rising + ML predicts danger
        (90, 89, 'CLEAR_AREA',  91.0,  False),
        (68, 71, 'PRE_WARNING', 65.0,  False),  # Going DOWN — hysteresis test
        (66, 68, 'PRE_WARNING', 63.0,  False),  # Below threshold-hysteresis
    ]

    print(f"{'Level':>6}  {'Prev':>5}  {'Status':<14} {'Gate':>5}  {'Servo':>5}  {'LED':<8}  {'SMS':<5}  {'Buzzer'}")
    print('-' * 80)
    for lvl, prev, cur, ml, anom in test_cases:
        d = evaluate(lvl, prev, cur, ml, anom)
        print(f"{lvl:>5}%  {prev:>5}%  {d.status:<14} {d.gate_pct:>4}%  {d.gate_angle:>4}°  {d.led_color:<8}  {str(d.sms_required):<5}  {d.buzzer}")
        if d.ml_advisory:
            print(f"         ML: {d.ml_advisory}")
    print()