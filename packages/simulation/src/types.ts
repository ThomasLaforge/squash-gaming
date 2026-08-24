/** Contrat d'entrée indépendant du périphérique (ADR 0004). */
import type { GhostingState } from './ghosting';

export type ShotType = 'length' | 'drop' | 'lob' | 'push';

export interface ShotIntent {
  type: ShotType;
  requestedAtTick: number;
  releasedAtTick: number | null;
}

export type ShotTiming = 'early' | 'ideal' | 'late';

export interface ShotResult {
  shot: ShotType;
  accepted: boolean;
  timing: ShotTiming;
  quality: number;
  outputVelocity: Vec3;
}

export interface PlayerInput {
  movement: { x: number; y: number };
  aim: { x: number; y: number };
  shot: ShotIntent | null;
  effort: number;
  focus: boolean;
}

export type PlayerStance = 'idle' | 'moving' | 'lunging';
export type PlayerSupport = 'both' | 'left' | 'right';

export interface PlayerState {
  position: Vec3;
  velocity: { x: number; y: number };
  distanceToT: number;
  facing: number;
  stance: PlayerStance;
  support: PlayerSupport;
}

export interface InterceptionEstimate {
  position: Vec3;
  time: number;
  distance: number;
  reachable: boolean;
}

/** Position ou vitesse dans le repère 3D du court (m, m/s). */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** État autoritaire sérialisable de la simulation M1. */
export interface SimulationState {
  tick: number;
  time: number;
  position: Vec3;
  velocity: Vec3;
  floorContacts: number;
}

export interface RenderSnapshot extends SimulationState {
  speed: number;
  player: PlayerState;
  interception: InterceptionEstimate;
  ghosting: GhostingState;
  lastShot: ShotResult | null;
}

export type ContactSurface = 'sol' | 'frontal' | 'latere' | 'arriere';

export interface ContactInfo {
  surface: ContactSurface;
  point: Vec3;
  normal: Vec3;
  impactSpeed: number;
}

export type GameEvent =
  | { type: 'TICK'; tick: number; time: number }
  | { type: 'SHOT'; result: ShotResult }
  | ({ type: 'IMPACT' } & ContactInfo)
  | ({ type: 'TIN' } & Omit<ContactInfo, 'surface'>)
  | ({ type: 'OUT' } & Omit<ContactInfo, 'surface'>)
  | ({ type: 'SECOND_REBOND' } & Omit<ContactInfo, 'surface'>);

export interface SimulationInit {
  position?: Vec3;
  velocity?: Vec3;
  dt?: number;
  gravity?: number;
  playerPosition?: Vec3;
  assistStrength?: number;
}

export interface ScenarioInput {
  tick: number;
  input: PlayerInput;
}

export interface Scenario {
  name: string;
  position: Vec3;
  velocity: Vec3;
  durationTicks: number;
  inputs?: ScenarioInput[];
  assertions: (finalState: SimulationState, events: GameEvent[]) => void;
}
