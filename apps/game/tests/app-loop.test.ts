import { describe, expect, it } from 'vitest';
import { FixedStepAccumulator } from '../src/fixed-step';

const SIM_HZ = 120;

describe('App — boucle à pas fixe', () => {
  it.each([30, 60, 120])(
    'avance le même nombre de ticks après une seconde rendue à %i Hz',
    (renderHz) => {
      const accumulator = new FixedStepAccumulator(SIM_HZ);
      let ticks = 0;

      for (let frame = 0; frame < renderHz; frame += 1) {
        accumulator.advance(1000 / renderHz, () => {
          ticks += 1;
        });
      }

      expect(ticks).toBe(120);
    }
  );

  it('borne explicitement un retard de rendu important', () => {
    const accumulator = new FixedStepAccumulator(SIM_HZ, 250);
    let ticks = 0;

    accumulator.advance(1000, () => {
      ticks += 1;
    });

    expect(ticks).toBe(30);
  });
});
