import {
  INTERCEPTION_HORIZON,
  PLAYER_ACCELERATION,
  PLAYER_ASSIST_STRENGTH,
  PLAYER_BRAKING,
  PLAYER_LUNGE_DISTANCE,
  PLAYER_MAX_SPEED,
  PLAYER_MAX_X,
  PLAYER_MAX_Y,
  PLAYER_MIN_X,
  PLAYER_MIN_Y,
  PLAYER_TURN_SPEED,
  T_POSITION
} from './constants';
import type { InterceptionEstimate, PlayerInput, PlayerState, PlayerSupport, PlayerStance, Vec3 } from './types';

const EPSILON = 1e-6;
const FRONT_FACING = Math.PI;

export function createPlayerState(position: Vec3 = { x: T_POSITION, y: 0, z: 0 }): PlayerState {
  const normalizedPosition = { x: position.x, y: position.y, z: 0 };
  return {
    position: normalizedPosition,
    velocity: { x: 0, y: 0 },
    distanceToT: Math.hypot(normalizedPosition.x - T_POSITION, normalizedPosition.y),
    facing: FRONT_FACING,
    stance: 'idle',
    support: 'both'
  };
}

export function advancePlayer(
  state: PlayerState,
  input: PlayerInput,
  target: InterceptionEstimate,
  dt: number,
  assistStrength = PLAYER_ASSIST_STRENGTH
): PlayerState {
  const inputMagnitude = Math.min(1, Math.hypot(input.movement.x, input.movement.y));
  // La vue est depuis l'arrière du court : le côté positif du plan y est à
  // gauche de l'écran. L'axe horizontal sémantique doit donc être inversé
  // avant de rejoindre les coordonnées du terrain.
  const intent = { x: input.movement.y, y: -input.movement.x };
  const intendedLength = Math.hypot(intent.x, intent.y);
  let direction = intendedLength > EPSILON
    ? { x: intent.x / intendedLength, y: intent.y / intendedLength }
    : { x: 0, y: 0 };

  const targetDirection = {
    x: target.position.x - state.position.x,
    y: target.position.y - state.position.y
  };
  const targetLength = Math.hypot(targetDirection.x, targetDirection.y);
  if (intendedLength > EPSILON && targetLength > EPSILON) {
    const normalizedTarget = { x: targetDirection.x / targetLength, y: targetDirection.y / targetLength };
    const compatibility = direction.x * normalizedTarget.x + direction.y * normalizedTarget.y;
    if (compatibility > 0) {
      const blend = Math.min(1, Math.max(0, assistStrength) * compatibility);
      direction = normalize({
        x: direction.x * (1 - blend) + normalizedTarget.x * blend,
        y: direction.y * (1 - blend) + normalizedTarget.y * blend
      });
    }
  }

  const desiredSpeed = PLAYER_MAX_SPEED * inputMagnitude;
  const desiredVelocity = { x: direction.x * desiredSpeed, y: direction.y * desiredSpeed };
  const acceleration = desiredSpeed > EPSILON ? PLAYER_ACCELERATION : PLAYER_BRAKING;
  const velocity = approachVelocity(state.velocity, desiredVelocity, acceleration * dt);
  const position = {
    x: clamp(state.position.x + velocity.x * dt, PLAYER_MIN_X, PLAYER_MAX_X),
    y: clamp(state.position.y + velocity.y * dt, PLAYER_MIN_Y, PLAYER_MAX_Y),
    z: 0
  };
  const speed = Math.hypot(velocity.x, velocity.y);
  const movingBackward = intent.x > EPSILON;
  const movingSideways = Math.abs(intent.x) <= EPSILON && Math.abs(intent.y) > EPSILON;
  const facingTarget = movingSideways
    ? FRONT_FACING
    : Math.atan2(direction.y, direction.x);
  const facing = intendedLength > EPSILON && !movingBackward
    ? approachAngle(state.facing, facingTarget, PLAYER_TURN_SPEED * dt)
    : state.facing;
  const stance = getStance(inputMagnitude, speed, targetLength);

  return {
    position,
    velocity,
    distanceToT: Math.hypot(position.x - T_POSITION, position.y),
    facing,
    stance,
    support: getSupport(velocity, stance)
  };
}

export function estimateInterception(
  ball: { position: Vec3; velocity: Vec3 },
  player: PlayerState,
  gravity: number
): InterceptionEstimate {
  const targetZ = 0;
  const height = ball.position.z - targetZ;
  const time = solveGroundTime(height, ball.velocity.z, gravity);
  const position = {
    x: clamp(ball.position.x + ball.velocity.x * time, PLAYER_MIN_X, PLAYER_MAX_X),
    y: clamp(ball.position.y + ball.velocity.y * time, PLAYER_MIN_Y, PLAYER_MAX_Y),
    z: targetZ
  };
  const distance = Math.hypot(position.x - player.position.x, position.y - player.position.y);
  return {
    position,
    time,
    distance,
    reachable: time <= INTERCEPTION_HORIZON && distance <= PLAYER_MAX_SPEED * Math.max(time, 0.05)
  };
}

function solveGroundTime(height: number, verticalVelocity: number, gravity: number): number {
  if (height <= 0) return 0;
  const discriminant = verticalVelocity ** 2 - 2 * gravity * height;
  if (discriminant <= 0) return INTERCEPTION_HORIZON;
  const fallingTime = (-verticalVelocity - Math.sqrt(discriminant)) / gravity;
  const risingTime = (-verticalVelocity + Math.sqrt(discriminant)) / gravity;
  const candidates = [fallingTime, risingTime].filter((candidate) => candidate >= 0);
  return Math.min(INTERCEPTION_HORIZON, candidates.length > 0 ? Math.max(...candidates) : INTERCEPTION_HORIZON);
}

function approachVelocity(
  current: { x: number; y: number },
  target: { x: number; y: number },
  maxDelta: number
): { x: number; y: number } {
  const delta = { x: target.x - current.x, y: target.y - current.y };
  const length = Math.hypot(delta.x, delta.y);
  if (length <= maxDelta || length <= EPSILON) return target;
  return { x: current.x + (delta.x / length) * maxDelta, y: current.y + (delta.y / length) * maxDelta };
}

function approachAngle(current: number, target: number, maxDelta: number): number {
  let delta = target - current;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return current + Math.sign(delta) * Math.min(Math.abs(delta), maxDelta);
}

function normalize(vector: { x: number; y: number }): { x: number; y: number } {
  const length = Math.hypot(vector.x, vector.y);
  return length <= EPSILON ? { x: 0, y: 0 } : { x: vector.x / length, y: vector.y / length };
}

function getStance(inputMagnitude: number, speed: number, targetDistance: number): PlayerStance {
  if (speed <= 0.08) return 'idle';
  if (inputMagnitude >= 0.85 && targetDistance <= PLAYER_LUNGE_DISTANCE) return 'lunging';
  return 'moving';
}

function getSupport(velocity: { x: number; y: number }, stance: PlayerStance): PlayerSupport {
  if (stance === 'idle' || Math.abs(velocity.y) < 0.2) return 'both';
  return velocity.y < 0 ? 'left' : 'right';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
