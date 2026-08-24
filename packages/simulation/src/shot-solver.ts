import { BALL_RADIUS } from './constants';
import type { PlayerState, ShotIntent, ShotResult, ShotTiming, Vec3 } from './types';

const HIT_HEIGHT = 1.1;
const HIT_DISTANCE = 1.35;
const TIMING_TOLERANCE = 0.22;

interface ShotProfile {
  horizontalSpeed: number;
  verticalSpeed: number;
  aimInfluence: number;
}

const SHOT_PROFILES: Record<ShotIntent['type'], ShotProfile> = {
  length: { horizontalSpeed: 8.2, verticalSpeed: 2.4, aimInfluence: 0.45 },
  drop: { horizontalSpeed: 3.1, verticalSpeed: 1.1, aimInfluence: 0.28 },
  lob: { horizontalSpeed: 4.5, verticalSpeed: 5.8, aimInfluence: 0.5 },
  push: { horizontalSpeed: 6.2, verticalSpeed: 1.8, aimInfluence: 0.65 }
};

export function solveShot(
  intent: ShotIntent,
  player: PlayerState,
  ball: { position: Vec3; velocity: Vec3 },
  aim: { x: number; y: number }
): ShotResult {
  const profile = SHOT_PROFILES[intent.type];
  const distance = Math.hypot(
    ball.position.x - player.position.x,
    ball.position.y - player.position.y,
    ball.position.z - HIT_HEIGHT
  );
  const timing = classifyTiming(ball.position.z);
  const accepted = distance <= HIT_DISTANCE && ball.position.z >= BALL_RADIUS;
  const timingQuality = timing === 'ideal' ? 1 : timing === 'early' ? 0.72 : 0.48;
  const quality = accepted ? timingQuality : 0;
  const side = clamp(aim.x, -1, 1) * profile.aimInfluence;
  const forward = -profile.horizontalSpeed * (0.9 + clamp(-aim.y, -1, 1) * 0.1);

  return {
    shot: intent.type,
    accepted,
    timing,
    quality,
    outputVelocity: accepted
      ? { x: forward * quality, y: profile.horizontalSpeed * side * quality, z: profile.verticalSpeed * quality }
      : { x: ball.velocity.x, y: ball.velocity.y, z: ball.velocity.z }
  };
}

function classifyTiming(height: number): ShotTiming {
  if (height > HIT_HEIGHT + TIMING_TOLERANCE) return 'early';
  if (height < HIT_HEIGHT - TIMING_TOLERANCE) return 'late';
  return 'ideal';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
