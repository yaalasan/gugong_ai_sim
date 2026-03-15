"""
physics.py — Seismic Structural Response Engine
================================================
Implements the damped harmonic oscillator model for
earthquake response simulation using numpy.

Physical model:
    mẍ + cẋ + kx = -mẍ_ground

In normalised form:
    ẍ + 2ζωₙẋ + ωₙ²x = -ẍ_ground

Steady-state solution for sinusoidal excitation:
    x(t) = A · H(r,ζ) · sin(ωt - φ)
"""

import numpy as np
from dataclasses import dataclass


@dataclass
class SimulationParams:
    magnitude: float    # 0–9 Richter / moment magnitude
    frequency: float    # Hz — earthquake dominant frequency
    damping: float      # ζ — damping ratio 0–1
    duration: float     # seconds of simulation
    dt: float = 0.01    # time step in seconds


@dataclass
class SimulationResult:
    time: list
    ground: list
    concrete: list
    dougong: list
    max_concrete_disp: float
    max_dougong_disp: float
    frequency_ratio: float
    resonance_risk: str


def compute_transfer_function(r: float, zeta: float) -> tuple[float, float]:
    """
    Compute dynamic amplification factor H and phase angle phi.

    H(r, ζ) = 1 / sqrt[(1 - r²)² + (2ζr)²]
    φ       = arctan(2ζr / (1 - r²))

    Args:
        r:    frequency ratio ω/ωₙ
        zeta: damping ratio ζ

    Returns:
        (H, phi) — amplification factor and phase lag in radians
    """
    denom = np.sqrt((1 - r**2)**2 + (2 * zeta * r)**2)
    H = 1.0 / denom if denom > 1e-6 else 10.0
    phi = np.arctan2(2 * zeta * r, 1 - r**2)
    return float(H), float(phi)


def compute_ground_motion(t: np.ndarray, magnitude: float, frequency: float) -> np.ndarray:
    """
    Sinusoidal ground motion model.
    x_ground(t) = A · sin(ω · t)

    Amplitude A is scaled from magnitude (0–9 → 0–1).
    """
    A = magnitude / 9.0
    omega = 2 * np.pi * frequency
    return A * np.sin(omega * t)


def compute_structural_response(
    t: np.ndarray,
    ground: np.ndarray,
    omega: float,
    omega_n: float,
    zeta: float,
    disp_scale: float = 1.0
) -> np.ndarray:
    """
    Steady-state structural displacement response.

    x(t) = A · H(r, ζ) · sin(ωt - φ)

    Args:
        t:           time array
        ground:      ground motion array
        omega:       excitation angular frequency
        omega_n:     structural natural frequency
        zeta:        damping ratio
        disp_scale:  scale factor for display

    Returns:
        Displacement array
    """
    A = np.max(np.abs(ground))
    r = omega / omega_n if omega_n > 0 else 1.0
    H, phi = compute_transfer_function(r, zeta)
    H_capped = min(H, 4.0)  # physical cap — prevents unrealistic values
    return A * H_capped * 0.25 * np.sin(omega * t - phi) * disp_scale


def run_simulation(params: SimulationParams) -> SimulationResult:
    """
    Run the full seismic simulation for both structure types.

    Returns time series for ground, concrete, and dougong responses.
    """
    t = np.arange(0, params.duration, params.dt)
    omega = 2 * np.pi * params.frequency

    # Structural natural frequency (slightly higher than excitation baseline)
    omega_n = omega * 1.2

    # Ground motion
    ground = compute_ground_motion(t, params.magnitude, params.frequency)

    # Concrete / masonry response — low damping, single DOF
    concrete = compute_structural_response(
        t, ground, omega, omega_n,
        zeta=params.damping,
        disp_scale=1.0
    )

    # Dougong timber response — higher effective damping from bracket joints
    # Effective damping is boosted by the multi-layer friction mechanism
    effective_zeta_dougong = min(params.damping * 1.5 + 0.1, 0.95)
    dougong = compute_structural_response(
        t, ground, omega, omega_n,
        zeta=effective_zeta_dougong,
        disp_scale=0.35 + params.damping * 0.2
    )

    # Frequency ratio
    r = omega / omega_n

    # Resonance risk assessment
    if 0.85 <= r <= 1.15 and params.damping < 0.1:
        resonance_risk = "CRITICAL"
    elif 0.75 <= r <= 1.25 and params.damping < 0.2:
        resonance_risk = "HIGH"
    elif 0.6 <= r <= 1.4:
        resonance_risk = "MODERATE"
    else:
        resonance_risk = "LOW"

    return SimulationResult(
        time=t.tolist(),
        ground=ground.tolist(),
        concrete=concrete.tolist(),
        dougong=dougong.tolist(),
        max_concrete_disp=float(np.max(np.abs(concrete))),
        max_dougong_disp=float(np.max(np.abs(dougong))),
        frequency_ratio=float(r),
        resonance_risk=resonance_risk,
    )


def compute_seismic_risk_score(
    magnitude: float,
    displacement: float,
    damping: float,
    frequency_ratio: float
) -> dict:
    """
    Compute a composite seismic risk index (0–100).

    Factors:
    - Structural displacement (primary — what actually breaks buildings)
    - Earthquake magnitude (raw energy)
    - Proximity to resonance
    - Damping adequacy
    """
    disp_score    = min(50, abs(displacement) * 80)
    mag_score     = magnitude * 3.5
    resonance_score = max(0, 15 * (1 - abs(frequency_ratio - 1.0)))
    damping_penalty = max(0, 10 * (0.05 - damping)) if damping < 0.05 else 0

    total = disp_score + mag_score + resonance_score + damping_penalty
    total = min(100, total)

    if total >= 70:
        level = "CRITICAL"
    elif total >= 40:
        level = "MODERATE"
    else:
        level = "LOW"

    return {
        "score": round(total, 1),
        "level": level,
        "breakdown": {
            "displacement": round(disp_score, 1),
            "magnitude":    round(mag_score, 1),
            "resonance":    round(resonance_score, 1),
            "damping":      round(damping_penalty, 1),
        }
    }
