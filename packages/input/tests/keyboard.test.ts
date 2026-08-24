import { describe, expect, it } from 'vitest';
import type { GameAction } from '../src';
import { KeyboardAdapter } from '../src';

const SIM_HZ = 120;

function makeTarget() {
  type KeyboardEventLike = { key: string; preventDefault?: () => void };
  const listeners: Record<string, ((event: KeyboardEventLike) => void)[]> = {};
  const preventedKeys: string[] = [];
  return {
    addEventListener(type: string, listener: (event: KeyboardEventLike) => void) {
      (listeners[type] ??= []).push(listener);
    },
    removeEventListener(type: string, listener: (event: KeyboardEventLike) => void) {
      listeners[type] = (listeners[type] ?? []).filter((l) => l !== listener);
    },
    press(key: string) {
      listeners.keydown?.forEach((l) => l({ key }));
    },
    release(key: string) {
      listeners.keyup?.forEach((l) => l({ key }));
    },
    preventedKeys,
    pressWithPreventDefault(key: string) {
      listeners.keydown?.forEach((l) => l({
        key,
        preventDefault: () => preventedKeys.push(key)
      }));
    }
  };
}

describe('KeyboardAdapter → contrat sémantique commun', () => {
  it('ZQSD maintenues produisent le même échantillon de mouvement qu’un stick', () => {
    const target = makeTarget();
    const actions: GameAction[] = [];
    const adapter = new KeyboardAdapter({
      simulationHz: SIM_HZ,
      onAction: (a) => actions.push(a)
    });
    adapter.attach(target);

    target.press('z');
    target.press('q');
    const frame = adapter.sample();
    // Haut + gauche ; le clavier émet des directions unitaires.
    expect(frame.movement).toEqual({ x: -1, y: -1 });

    target.release('z');
    const frame2 = adapter.sample();
    expect(frame2.movement).toEqual({ x: -1, y: 0 });

    adapter.detach(target);
    const frame3 = adapter.sample();
    expect(frame3.movement).toEqual({ x: 0, y: 0 });
    expect(actions.every((a) => a.kind === 'axis' && a.axis === 'movement')).toBe(true);
  });

  it('Space émet press-shot puis release-shot pour un shot length, avec intention de frappe', () => {
    const target = makeTarget();
    const adapter = new KeyboardAdapter({ simulationHz: SIM_HZ, now: () => 0.5 });
    adapter.attach(target);

    target.press(' ');
    const frame = adapter.sample();
    expect(frame.shotEdges).toEqual(['length']);

    const intent = adapter.consumeShotIntent();
    expect(intent).not.toBeNull();
    expect(intent?.type).toBe('length');
    expect(intent?.requestedAtTick).toBe(60); // 0.5 s × 120 Hz

    target.release(' ');
    const after = adapter.consumeShotIntent();
    expect(after).toBeNull();
  });

  it('empêche le navigateur de faire défiler la page avec une touche assignée', () => {
    const target = makeTarget();
    const adapter = new KeyboardAdapter({ simulationHz: SIM_HZ });
    adapter.attach(target);

    target.pressWithPreventDefault(' ');
    target.pressWithPreventDefault('x');

    expect(target.preventedKeys).toEqual([' ']);
  });

  it('E (lob) produit une intention distincte de Space (length)', () => {
    const target = makeTarget();
    const adapter = new KeyboardAdapter({ simulationHz: SIM_HZ, now: () => 1 });
    adapter.attach(target);

    target.press('e');
    adapter.sample();
    expect(adapter.consumeShotIntent()?.type).toBe('lob');

    target.press(' ');
    adapter.sample();
    expect(adapter.consumeShotIntent()?.type).toBe('length');

    target.press('Shift');
    adapter.sample();
    expect(adapter.consumeShotIntent()?.type).toBe('drop');

    target.press('r');
    adapter.sample();
    expect(adapter.consumeShotIntent()?.type).toBe('push');
  });

  it('F maintenu met focus à true dans tous les échantillons', () => {
    const target = makeTarget();
    const adapter = new KeyboardAdapter({ simulationHz: SIM_HZ });
    adapter.attach(target);

    target.press('f');
    expect(adapter.sample().focus).toBe(true);
    expect(adapter.sample().focus).toBe(true);

    target.release('f');
    expect(adapter.sample().focus).toBe(false);
  });

  it('les répétitions de touche clavier (key auto-repeat) ne doublent pas les events', () => {
    const target = makeTarget();
    const actions: GameAction[] = [];
    const adapter = new KeyboardAdapter({
      simulationHz: SIM_HZ,
      onAction: (a) => actions.push(a)
    });
    adapter.attach(target);

    target.press('e');
    target.press('e'); // auto-repeat simulé
    adapter.sample();
    const pressEdges = actions.filter((a) => a.kind === 'press-shot');
    expect(pressEdges).toHaveLength(1);
  });

  it('un mapping custom remplace les touches sans changer le contrat', () => {
    const target = makeTarget();
    const adapter = new KeyboardAdapter({
      simulationHz: SIM_HZ,
      mapping: {
        movement: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' },
        shots: { Enter: 'length' },
        effort: {},
        focus: 'ArrowDown'
      }
    });
    adapter.attach(target);

    target.press('w');
    expect(adapter.sample().movement).toEqual({ x: 0, y: 0 });

    target.press('ArrowUp');
    expect(adapter.sample().movement).toEqual({ x: 0, y: -1 });
  });

  it('un remapping à chaud réinitialise les touches maintenues', () => {
    const target = makeTarget();
    const adapter = new KeyboardAdapter({ simulationHz: SIM_HZ });
    adapter.attach(target);
    target.press('z');
    expect(adapter.sample().movement.y).toBe(-1);

    adapter.setMapping({
      movement: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' },
      shots: {},
      effort: {},
      focus: null
    });

    expect(adapter.sample().movement).toEqual({ x: 0, y: 0 });
    target.press('ArrowUp');
    expect(adapter.sample().movement).toEqual({ x: 0, y: -1 });
  });
});
