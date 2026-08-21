/** Contrat d'entrée indépendant du périphérique (ADR 0004). */
export interface ShotIntent {
  type: string;
  requestedAtTick: number;
  releasedAtTick: number | null;
}

export interface PlayerInput {
  movement: { x: number; y: number };
  aim: { x: number; y: number };
  shot: ShotIntent | null;
  effort: number;
  focus: boolean;
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
  | ({ type: 'IMPACT' } & ContactInfo)
  | ({ type: 'TIN' } & Omit<ContactInfo, 'surface'>)
  | ({ type: 'OUT' } & Omit<ContactInfo, 'surface'>)
  | ({ type: 'SECOND_REBOND' } & Omit<ContactInfo, 'surface'>);

export interface SimulationInit {
  position?: Vec3;
  velocity?: Vec3;
  dt?: number;
  gravity?: number;
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
