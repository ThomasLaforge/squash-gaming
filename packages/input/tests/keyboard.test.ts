import { describe, expect, it } from 'vitest';
import type { GameAction } from '../src';
import { KeyboardAdapter } from '../src';

const SIM_HZ = 120;

function makeTarget() {
  const listeners: Record<string, ((event: { code: string }) => void)[]> = {};
  return {
    addEventListener(type: string, listener: (event: { code: string }) => void) {
      (listeners[type] ??= []).push(listener);
    },
    removeEventListener(type: string, listener: (event: { code: string }) => void) {
      listeners[type] = (listeners[type] ?? []).filter((l) => l !== listener);
    },
    press(code: string) {
      listeners.keydown?.forEach((l) => l({ code }));
    },
    release(code: string) {
      listeners.keyup?.forEach((l) => l({ code }));
    }
  };
}

describe('KeyboardAdapter → contrat sémantique commun', () => {
  it('WASD maintenues produisent le même échantillon de mouvement qu’un stick', () => {
    const target = makeTarget();
    const actions: GameAction[] = [];
    const adapter = new KeyboardAdapter({
      simulationHz: SIM_HZ,
      onAction: (a) => actions.push(a)
    });
    adapter.attach(target);

    target.press('KeyW');
    target.press('KeyA');
    const frame = adapter.sample();
    // Haut + gauche ; le clavier émet des directions unitaires.
    expect(frame.movement).toEqual({ x: -1, y: -1 });

    target.release('KeyW');
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

    target.press('Space');
    const frame = adapter.sample();
    expect(frame.shotEdges).toEqual(['length']);

    const intent = adapter.consumeShotIntent();
    expect(intent).not.toBeNull();
    expect(intent?.type).toBe('length');
    expect(intent?.requestedAtTick).toBe(60); // 0.5 s × 120 Hz

    target.release('Space');
    const after = adapter.consumeShotIntent();
    expect(after).toBeNull();
  });

  it('E (lob) produit une intention distincte de Space (length)', () => {
    const target = makeTarget();
    const adapter = new KeyboardAdapter({ simulationHz: SIM_HZ, now: () => 1 });
    adapter.attach(target);

    target.press('KeyE');
    adapter.sample();
    expect(adapter.consumeShotIntent()?.type).toBe('lob');

    target.press('Space');
    adapter.sample();
    expect(adapter.consumeShotIntent()?.type).toBe('length');

    target.press('ShiftLeft');
    adapter.sample();
    expect(adapter.consumeShotIntent()?.type).toBe('drop');

    target.press('KeyQ');
    adapter.sample();
    expect(adapter.consumeShotIntent()?.type).toBe('push');
  });

  it('F maintenu met focus à true dans tous les échantillons', () => {
    const target = makeTarget();
    const adapter = new KeyboardAdapter({ simulationHz: SIM_HZ });
    adapter.attach(target);

    target.press('KeyF');
    expect(adapter.sample().focus).toBe(true);
    expect(adapter.sample().focus).toBe(true);

    target.release('KeyF');
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

    target.press('KeyE');
    target.press('KeyE'); // auto-repeat simulé
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

    target.press('KeyW');
    expect(adapter.sample().movement).toEqual({ x: 0, y: 0 });

    target.press('ArrowUp');
    expect(adapter.sample().movement).toEqual({ x: 0, y: -1 });
  });
});
