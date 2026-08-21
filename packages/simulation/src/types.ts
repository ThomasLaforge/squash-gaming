/**
 * Intention de frappe indépendante du périphérique (ADR 0004).
 * La mécanique d'exécution arrive au M3 ; le contrat existe déjà.
 */
export interface ShotIntent {
  /** Type de coup demandé (la liste des coups est validée au M3). */
  type: string;
  /** Tick de simulation où le coup a été pressé. */
  requestedAtTick: number;
  /** Tick de simulation où le coup a été relâché, si connu. */
  releasedAtTick: number | null;
}

export interface PlayerInput {
  /** Mouvement normalisé [-1, 1] par composante (haut = y négatif). */
  movement: { x: number; y: number };
  /** Visée normalisée [-1, 1] par composante. */
  aim: { x: number; y: number };
  /** Intention de frappe en cours, ou null. */
  shot: ShotIntent | null;
  /** Effort normalisé [0, 1]. */
  effort: number;
  /** Focus maintenu. */
  focus: boolean;
}

export interface SimulationState {
  tick: number;
  time: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
}

export interface RenderSnapshot {
  tick: number;
  time: number;
  position: { x: number; y: number };
}

export type GameEvent =
  | { type: 'TICK'; tick: number; time: number }
  | { type: 'IMPACT_FRONTAL'; point: { x: number; y: number } }
  | { type: 'IMPACT_LATERAL'; point: { x: number; y: number; side: string } }
  | { type: 'IMPACT_ARRIERE'; point: { x: number; y: number } }
  | { type: 'IMPACT_SOL'; point: { x: number; y: number } }
  | { type: 'TIN' }
  | { type: 'OUT' }
  | { type: 'SECOND_REBOND' };

export interface Scenario {
  name: string;
  initialState: SimulationState;
  inputs: { tick: number; input: PlayerInput }[];
  durationTicks: number;
  assertions: (finalState: SimulationState, events: GameEvent[]) => void;
}
