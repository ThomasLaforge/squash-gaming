import { describe, expect, it } from 'vitest';
import { KeyboardAdapter, GamepadAdapter, type GamepadLike } from '@squash-gaming/input';
import { Simulation } from '@squash-gaming/simulation';
import { FixedStepAccumulator } from '../src/fixed-step';

const SIM_HZ = 120;

function makeKeyTarget() {
  const listeners: Record<string, ((e: { code: string }) => void)[]> = {
    keydown: [],
    keyup: []
  };
  return {
    addEventListener(type: string, listener: (e: { code: string }) => void) {
      (listeners[type] ??= []).push(listener);
    },
    removeEventListener() {},
    press(code: string) {
      listeners.keydown.forEach((l) => l({ code }));
    }
  };
}

/**
 * Vérifie que la boucle de l'app (simulation + adaptateurs) fonctionne
 * sans DOM et reste déterministe : le pas fixe produit le même état
 * quelle que soit la façon dont on avance le temps.
 */
describe('App — boucle simulation headless', () => {
  it.each([30, 60, 120])(
    'produit le même état après une seconde rendue à %i Hz',
    (renderHz) => {
      const simulation = new Simulation(undefined, SIM_HZ);
      const accumulator = new FixedStepAccumulator(SIM_HZ);
      const zeroInput = {
        movement: { x: 0, y: 0 },
        aim: { x: 0, y: 0 },
        shot: null,
        effort: 0.5,
        focus: false
      };

      for (let frame = 0; frame < renderHz; frame += 1) {
        accumulator.advance(1000 / renderHz, () => simulation.tick(zeroInput));
      }

      expect(simulation.getState().tick).toBe(120);
      expect(simulation.getState().time).toBeCloseTo(1, 6);
    }
  );

  it('borne explicitement un retard de rendu important', () => {
    const simulation = new Simulation(undefined, SIM_HZ);
    const accumulator = new FixedStepAccumulator(SIM_HZ, 250);
    const zeroInput = {
      movement: { x: 0, y: 0 },
      aim: { x: 0, y: 0 },
      shot: null,
      effort: 0.5,
      focus: false
    };
    accumulator.advance(1000, () => simulation.tick(zeroInput));

    expect(simulation.getState().tick).toBe(30);
    expect(simulation.getState().time).toBeCloseTo(0.25, 6);
  });

  it('l’adaptateur clavier alimente la simulation sans DOM', () => {
    const sim = new Simulation(undefined, SIM_HZ);
    const keyboard = new KeyboardAdapter({ simulationHz: SIM_HZ });
    const target = makeKeyTarget();
    keyboard.attach(target);
    target.press('KeyD');

    for (let i = 0; i < 60; i += 1) {
      sim.tick(keyboard.samplePlayerInput());
    }
    const state = sim.getState();
    expect(state.velocity.x).toBeGreaterThan(0);
    expect(state.position.x).toBeGreaterThan(0);
  });

  it('la manette et le clavier produisent des intentions de frappe équivalentes', () => {
    const pad: GamepadLike = {
      index: 0,
      connected: true,
      axes: [0, 0, 0, 0],
      buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }))
    };
    pad.buttons[0] = { pressed: true, value: 1 };
    const gamepad = new GamepadAdapter({
      simulationHz: SIM_HZ,
      now: () => 0,
      getGamepads: () => [pad]
    });
    gamepad.poll();
    const gIntent = gamepad.consumeShotIntent();

    const keyTarget = makeKeyTarget();
    const keyboard = new KeyboardAdapter({ simulationHz: SIM_HZ, now: () => 0 });
    keyboard.attach(keyTarget);
    keyTarget.press('Space');
    keyboard.sample();
    const kIntent = keyboard.consumeShotIntent();

    expect(kIntent?.type).toBe('length');
    expect(gIntent?.type).toBe('length');
    expect(kIntent).toEqual(gIntent);
  });
});
