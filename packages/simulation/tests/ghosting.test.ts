import { describe, expect, it } from 'vitest';

import {
  GHOSTING_ROUTE,
  advanceGhosting,
  createPlayerState,
  createGhostingState,
  startGhosting
} from '../src';

describe('Ghosting M2', () => {
  it('démarre sur le premier coin et ignore une position hors cible', () => {
    const initial = startGhosting();
    const player = createPlayerState();
    const next = advanceGhosting(initial, player);

    expect(next.status).toBe('running');
    expect(next.targetIndex).toBe(0);
    expect(next.completedTargets).toBe(0);
    expect(next.elapsedTicks).toBe(1);
  });

  it('valide les cibles dans l’ordre et termine après les six points', () => {
    let state = startGhosting();
    for (const target of GHOSTING_ROUTE) {
      state = advanceGhosting(state, createPlayerState(target.position));
      expect(state.completedTargets).toBeGreaterThan(0);
    }

    expect(state.status).toBe('completed');
    expect(state.completedTargets).toBe(GHOSTING_ROUTE.length);
    expect(state.targetIndex).toBe(GHOSTING_ROUTE.length);
  });

  it('réinitialise le parcours sans conserver sa progression', () => {
    const state = createGhostingState();
    expect(state).toEqual({ status: 'idle', targetIndex: 0, elapsedTicks: 0, completedTargets: 0 });
  });
});
