/** Constantes officielles du laboratoire M1. Le repère est Z-up. */

export const COURT_LENGTH = 9.75;
export const COURT_WIDTH = 6.4;
export const COURT_HALF_WIDTH = COURT_WIDTH / 2;
export const CEILING_MIN_HEIGHT = 5.64;

export const FRONT_OUT_HEIGHT = 4.57;
export const BACK_OUT_HEIGHT = 2.13;
export const TIN_HEIGHT = 0.48;
export const SERVICE_LINE_HEIGHT = 1.78;
export const SHORT_LINE_FROM_BACK = 4.26;

export function sideOutHeight(x: number): number {
  return FRONT_OUT_HEIGHT + (BACK_OUT_HEIGHT - FRONT_OUT_HEIGHT) * (x / COURT_LENGTH);
}

export const BALL_RADIUS = 0.0425;
export const BALL_MASS = 0.038;
export const GRAVITY = -9.81;
export const SOL_FRICTION = 0.7;
export const DRAG = 0;

export const RESTITUTION = {
  sol: 0.8,
  frontal: 0.75,
  latere: 0.75,
  arriere: 0.75
} as const;

export const SIMULATION_HZ = 120;
export const FIXED_DT = 1 / SIMULATION_HZ;
export const TUNNELING_REF_SPEED = 100;
