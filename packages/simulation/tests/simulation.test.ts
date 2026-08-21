import { describe, it, expect, vi } from 'vitest';
import { Simulation } from '../src/simulation';
import { PlayerInput } from '../src/types';

describe('Simulation Headless', () => {
  const zeroInput: PlayerInput = {
    movement: { x: 0, y: 0 },
    aim: { x: 0, y: 0 },
    shot: null,
    effort: 1,
    focus: false
  };

  it('devrait initialiser à 0 ticks et temps 0', () => {
    const sim = new Simulation();
    const state = sim.getState();
    expect(state.tick).toBe(0);
    expect(state.time).toBe(0);
    expect(state.position).toEqual({ x: 0, y: 0 });
    expect(state.velocity).toEqual({ x: 0, y: 0 });
  });

  it('devrait avancer le pas de temps et le tick à chaque tick()', () => {
    const sim = new Simulation(undefined, 120);
    sim.tick(zeroInput);
    const state = sim.getState();
    expect(state.tick).toBe(1);
    expect(state.time).toBeCloseTo(1 / 120, 5);
  });

  it('devrait appliquer le mouvement en fonction de l\'input de déplacement et de l\'effort', () => {
    const sim = new Simulation({ position: { x: 10, y: 20 } }, 100); // 100Hz = dt is 0.01s
    const input: PlayerInput = {
      ...zeroInput,
      movement: { x: 1, y: -1 },
      effort: 0.8
    };

    // Speed is 5. movement is 1, -1. effort is 0.8.
    // velocity should be x = 1 * 5 * 0.8 = 4, y = -1 * 5 * 0.8 = -4
    // delta position should be velocity * dt = 4 * 0.01 = 0.04, -4 * 0.01 = -0.04
    // New position: x = 10.04, y = 19.96
    sim.tick(input);

    const state = sim.getState();
    expect(state.velocity.x).toBeCloseTo(4, 5);
    expect(state.velocity.y).toBeCloseTo(-4, 5);
    expect(state.position.x).toBeCloseTo(10.04, 5);
    expect(state.position.y).toBeCloseTo(19.96, 5);
  });

  it('devrait émettre un événement TICK pour chaque tick', () => {
    const sim = new Simulation();
    const listener = vi.fn();
    sim.addEventListener(listener);

    sim.tick(zeroInput);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      type: 'TICK',
      tick: 1,
      time: 1 / 120
    });
  });
});
