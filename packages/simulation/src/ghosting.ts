import { COURT_LENGTH, COURT_HALF_WIDTH, PLAYER_RADIUS, T_POSITION } from './constants';
import type { PlayerState, Vec3 } from './types';

export type GhostingStatus = 'idle' | 'running' | 'completed';

export interface GhostingTarget {
  id: string;
  label: string;
  position: Vec3;
}

export interface GhostingState {
  status: GhostingStatus;
  targetIndex: number;
  elapsedTicks: number;
  completedTargets: number;
}

export const GHOSTING_HIT_RADIUS = 0.55;

export const GHOSTING_ROUTE: readonly GhostingTarget[] = [
  target('front-left', 'Coin avant gauche', PLAYER_RADIUS + 0.35, COURT_HALF_WIDTH - PLAYER_RADIUS - 0.35),
  target('front-right', 'Coin avant droit', PLAYER_RADIUS + 0.35, -COURT_HALF_WIDTH + PLAYER_RADIUS + 0.35),
  target('back-left', 'Coin arrière gauche', COURT_LENGTH - PLAYER_RADIUS - 0.35, COURT_HALF_WIDTH - PLAYER_RADIUS - 0.35),
  target('back-right', 'Coin arrière droit', COURT_LENGTH - PLAYER_RADIUS - 0.35, -COURT_HALF_WIDTH + PLAYER_RADIUS + 0.35),
  target('t-left', 'Côté T gauche', T_POSITION, 2.1),
  target('t-right', 'Côté T droit', T_POSITION, -2.1)
];

export function createGhostingState(): GhostingState {
  return { status: 'idle', targetIndex: 0, elapsedTicks: 0, completedTargets: 0 };
}

export function startGhosting(): GhostingState {
  return { status: 'running', targetIndex: 0, elapsedTicks: 0, completedTargets: 0 };
}

export function advanceGhosting(state: GhostingState, player: PlayerState): GhostingState {
  if (state.status !== 'running') return state;

  const current = GHOSTING_ROUTE[state.targetIndex];
  if (!current) return { ...state, status: 'completed' };

  const distance = Math.hypot(player.position.x - current.position.x, player.position.y - current.position.y);
  if (distance > GHOSTING_HIT_RADIUS) {
    return { ...state, elapsedTicks: state.elapsedTicks + 1 };
  }

  const completedTargets = state.completedTargets + 1;
  const targetIndex = state.targetIndex + 1;
  return {
    status: targetIndex >= GHOSTING_ROUTE.length ? 'completed' : 'running',
    targetIndex,
    elapsedTicks: state.elapsedTicks + 1,
    completedTargets
  };
}

function target(id: string, label: string, x: number, y: number): GhostingTarget {
  return { id, label, position: { x, y, z: 0 } };
}
