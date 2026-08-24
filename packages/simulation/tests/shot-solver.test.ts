import { describe, expect, it } from 'vitest';

import { createPlayerState, solveShot, type ShotIntent, type Vec3 } from '../src';

const player = createPlayerState({ x: 5.49, y: 0, z: 0 });

function intent(type: ShotIntent['type']): ShotIntent {
  return { type, requestedAtTick: 10, releasedAtTick: null };
}

function ball(z: number, x = 4.8): { position: Vec3; velocity: Vec3 } {
  return {
    position: { x, y: 0, z },
    velocity: { x: 0, y: 0, z: 0 }
  };
}

describe('Solveur de frappe M3', () => {
  it('produit une sortie déterministe pour les quatre coups', () => {
    const outputs = (['length', 'drop', 'lob', 'push'] as const).map((type) => solveShot(intent(type), player, ball(1.1), { x: 0, y: 0 }));

    expect(outputs.every((result) => result.accepted && result.timing === 'ideal')).toBe(true);
    expect(outputs.map((result) => result.outputVelocity)).toEqual([
      { x: -8.2 * 0.9, y: 0, z: 2.4 },
      { x: -3.1 * 0.9, y: 0, z: 1.1 },
      { x: -4.5 * 0.9, y: 0, z: 5.8 },
      { x: -6.2 * 0.9, y: 0, z: 1.8 }
    ]);
  });

  it('dégrade tôt et tard de façon lisible', () => {
    const early = solveShot(intent('length'), player, ball(1.6), { x: 0, y: 0 });
    const ideal = solveShot(intent('length'), player, ball(1.1), { x: 0, y: 0 });
    const late = solveShot(intent('length'), player, ball(0.7), { x: 0, y: 0 });

    expect(early.timing).toBe('early');
    expect(ideal.timing).toBe('ideal');
    expect(late.timing).toBe('late');
    expect(early.quality).toBeGreaterThan(late.quality);
    expect(ideal.quality).toBe(1);
  });

  it('refuse une frappe hors de portée sans produire une vitesse aberrante', () => {
    const result = solveShot(intent('lob'), player, ball(1.1, 2), { x: 1, y: 0 });

    expect(result.accepted).toBe(false);
    expect(result.quality).toBe(0);
    expect(result.outputVelocity).toEqual({ x: 0, y: 0, z: 0 });
  });
});
