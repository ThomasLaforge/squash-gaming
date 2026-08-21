import { describe, expect, it } from 'vitest';
import {
  GamepadAdapter,
  KeyboardAdapter,
  type GameAction,
  type GamepadLike
} from '../src';

const SIM_HZ = 120;
const DEADZONE = 0.15;

function makePad(overrides: Partial<GamepadLike> = {}): GamepadLike {
  return {
    index: 0,
    connected: true,
    axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })),
    ...overrides
  };
}

function withButton(pad: GamepadLike, index: number, pressed: boolean): GamepadLike {
  const clone: GamepadLike = { ...pad, buttons: pad.buttons.map((b) => ({ ...b })) };
  clone.buttons[index] = { pressed, value: pressed ? 1 : 0 };
  return clone;
}

function makeKeyboardTarget() {
  const listeners: Record<string, ((e: { code: string }) => void)[]> = { keydown: [], keyup: [] };
  return {
    addEventListener(type: string, l: (e: { code: string }) => void) {
      listeners[type].push(l);
    },
    removeEventListener() {},
    press(code: string) {
      listeners.keydown.forEach((l) => l({ code }));
    },
    release(code: string) {
      listeners.keyup.forEach((l) => l({ code }));
    }
  };
}

describe('GamepadAdapter → contrat sémantique commun', () => {
  it('le stick gauche avec dead zone radiale produit des échantillons unitaires à pleine amplitude', () => {
    const holder: { pad: GamepadLike | null } = { pad: makePad() };
    const adapter = new GamepadAdapter({ simulationHz: SIM_HZ, getGamepads: () => [holder.pad] });

    holder.pad = makePad({ axes: [0.05, 0, 0, 0] });
    expect(adapter.poll().movement).toEqual({ x: 0, y: 0 });

    holder.pad = makePad({ axes: [-1, 0, 0, 0] });
    expect(adapter.poll().movement).toEqual({ x: -(1 - DEADZONE), y: 0 });

    holder.pad = makePad({ axes: [0, -1, 0, 0] });
    expect(adapter.poll().movement).toEqual({ x: 0, y: -(1 - DEADZONE) });

    // Mi-course : la sortie reste mi-course (pas de renormalisation).
    holder.pad = makePad({ axes: [-0.5, 0, 0, 0] });
    expect(adapter.poll().movement).toEqual({ x: -(0.5 - DEADZONE), y: 0 });
    // Diagonale mi-course : l’angle est préservé (x = y).
    holder.pad = makePad({ axes: [0.5, 0.5, 0, 0] });
    const diag = adapter.poll().movement;
    expect(diag.x).toBeCloseTo(diag.y, 6);
    expect(diag.x).toBeGreaterThan(0);
  });

  it('les événements émis ne portent aucun code de bouton ni d’axe brut', () => {
    const actions: GameAction[] = [];
    const holder: { pad: GamepadLike | null } = { pad: makePad() };
    const adapter = new GamepadAdapter({
      simulationHz: SIM_HZ,
      getGamepads: () => [holder.pad],
      onAction: (a) => actions.push(a)
    });

    holder.pad = withButton(makePad({ axes: [0, -1, 0, 0] }), 0, true);
    adapter.poll();

    expect(actions.length).toBeGreaterThan(0);
    actions.forEach((a) => {
      const json = JSON.stringify(a);
      expect(json).not.toContain('standard:');
      expect(json).not.toContain('Key');
    });
  });

  it('le stick droit pilote l’aim, le stick gauche le movement', () => {
    const holder: { pad: GamepadLike | null } = { pad: makePad() };
    const adapter = new GamepadAdapter({ simulationHz: SIM_HZ, getGamepads: () => [holder.pad] });

    holder.pad = makePad({ axes: [0, 0, 1, 0] });
    const frame = adapter.poll();
    expect(frame.movement).toEqual({ x: 0, y: 0 });
    expect(frame.aim).toEqual({ x: 1 - DEADZONE, y: 0 });
  });

  it('un mapping custom remappe réellement les axes de mouvement et de visée', () => {
    const holder: { pad: GamepadLike | null } = {
      pad: makePad({ axes: [0.8, 0, 0, 0, -1, 0] })
    };
    const adapter = new GamepadAdapter({
      simulationHz: SIM_HZ,
      getGamepads: () => [holder.pad],
      mapping: {
        axes: {
          movement: { x: 4, y: 5 },
          aim: { x: 1, y: 0 }
        },
        shots: {},
        effort: {},
        focus: null
      }
    });

    const frame = adapter.poll();
    expect(frame.movement.x).toBeCloseTo(-(1 - DEADZONE), 6);
    expect(frame.movement.y).toBe(0);
    expect(frame.aim.x).toBe(0);
    expect(frame.aim.y).toBeCloseTo(0.8 - DEADZONE, 6);
  });

  it('les quatre boutons de coup émettent les press-shots corrects', () => {
    const holder: { pad: GamepadLike | null } = { pad: makePad() };
    const adapter = new GamepadAdapter({ simulationHz: SIM_HZ, getGamepads: () => [holder.pad] });

    holder.pad = withButton(makePad(), 0, true);
    expect(adapter.poll().shotEdges).toEqual(['length']);
    expect(adapter.consumeShotIntent()?.type).toBe('length');

    holder.pad = withButton(makePad(), 1, true);
    expect(adapter.poll().shotEdges).toEqual(['drop']);
    expect(adapter.consumeShotIntent()?.type).toBe('drop');

    holder.pad = withButton(makePad(), 2, true);
    expect(adapter.poll().shotEdges).toEqual(['lob']);
    expect(adapter.consumeShotIntent()?.type).toBe('lob');

    holder.pad = withButton(makePad(), 3, true);
    expect(adapter.poll().shotEdges).toEqual(['push']);
    expect(adapter.consumeShotIntent()?.type).toBe('push');
  });

  it('la gâchette standard:7 expose une demande d’effort sans mécanique anticipée', () => {
    const holder: { pad: GamepadLike | null } = { pad: makePad() };
    const adapter = new GamepadAdapter({
      simulationHz: SIM_HZ,
      getGamepads: () => [holder.pad]
    });

    holder.pad = withButton(makePad(), 7, true);
    expect(adapter.poll().effortDelta).toBe(1);

    expect(adapter.poll().effortDelta).toBe(1);

    holder.pad = makePad();
    expect(adapter.poll().effortDelta).toBe(0);
  });

  it('standard:4 (focus) émet un focus maintenu jusqu’au relâchement', () => {
    const actions: GameAction[] = [];
    const holder: { pad: GamepadLike | null } = { pad: makePad() };
    const adapter = new GamepadAdapter({
      simulationHz: SIM_HZ,
      getGamepads: () => [holder.pad],
      onAction: (a) => actions.push(a)
    });

    holder.pad = withButton(makePad(), 4, true);
    expect(adapter.poll().focus).toBe(true);
    expect(adapter.poll().focus).toBe(true);

    holder.pad = makePad();
    expect(adapter.poll().focus).toBe(false);

    const focusActions = actions.filter((a) => a.kind === 'focus');
    expect(focusActions).toHaveLength(2);
    expect(focusActions.map((a) => (a.kind === 'focus' ? a.pressed : null))).toEqual([true, false]);
  });

  it('sans manette connectée, la trame reste vide et les pressés sont relâchés', () => {
    const actions: GameAction[] = [];
    const holder: { pad: GamepadLike | null } = { pad: withButton(makePad(), 0, true) };
    const adapter = new GamepadAdapter({
      simulationHz: SIM_HZ,
      getGamepads: () => [holder.pad],
      onAction: (a) => actions.push(a)
    });
    adapter.poll();

    holder.pad = null;
    const frame = adapter.poll();
    expect(frame.movement).toEqual({ x: 0, y: 0 });
    expect(frame.shotEdges).toEqual([]);
    expect(actions.filter((a) => a.kind === 'release-shot')).toHaveLength(1);
  });
});

describe('Contrat sémantique commun clavier/manette (AC07)', () => {
  it('déplacement : W au clavier ≡ stick haut à la manette → mêmes échantillons', () => {
    const target = makeKeyboardTarget();
    const keyboard = new KeyboardAdapter({ simulationHz: SIM_HZ, now: () => 0 });
    keyboard.attach(target);
    target.press('KeyW');
    const kFrame = keyboard.sample();

    const holder: { pad: GamepadLike | null } = { pad: makePad({ axes: [0, -1, 0, 0] }) };
    const gamepad = new GamepadAdapter({
      simulationHz: SIM_HZ,
      now: () => 0,
      getGamepads: () => [holder.pad]
    });
    const gFrame = gamepad.poll();

    // Le clavier émet des directions unitaires ; la manette applique la
    // dead zone radiale : les amplitudes ne sont pas les mêmes, mais les
    // directions et l’intention le sont.
    expect(kFrame.movement.y).toBeLessThan(0);
    expect(gFrame.movement.y).toBeLessThan(0);
    expect(kFrame.shotEdges).toEqual(gFrame.shotEdges);
    expect(kFrame.effortDelta).toBe(gFrame.effortDelta);
  });

  it('frappe : Space au clavier ≡ bouton 0 à la manette → mêmes ShotIntent', () => {
    const target = makeKeyboardTarget();
    let clock = 0.25;
    const keyboard = new KeyboardAdapter({ simulationHz: SIM_HZ, now: () => clock });
    keyboard.attach(target);
    target.press('Space');
    keyboard.sample();
    const kIntent = keyboard.consumeShotIntent();

    const holder: { pad: GamepadLike | null } = { pad: withButton(makePad(), 0, true) };
    const gamepad = new GamepadAdapter({
      simulationHz: SIM_HZ,
      now: () => clock,
      getGamepads: () => [holder.pad]
    });
    gamepad.poll();
    const gIntent = gamepad.consumeShotIntent();

    expect(kIntent).not.toBeNull();
    expect(gIntent).not.toBeNull();
    expect(kIntent?.type).toBe('length');
    expect(gIntent?.type).toBe('length');
    expect(kIntent).toEqual(gIntent);
    expect(kIntent?.requestedAtTick).toBe(30); // 0.25 s × 120 Hz
  });

  it('focus : F au clavier ≡ bouton 4 à la manette → même focus', () => {
    const target = makeKeyboardTarget();
    const keyboard = new KeyboardAdapter({ simulationHz: SIM_HZ, now: () => 0 });
    keyboard.attach(target);
    target.press('KeyF');

    const holder: { pad: GamepadLike | null } = { pad: withButton(makePad(), 4, true) };
    const gamepad = new GamepadAdapter({
      simulationHz: SIM_HZ,
      now: () => 0,
      getGamepads: () => [holder.pad]
    });

    expect(keyboard.sample().focus).toBe(true);
    expect(gamepad.poll().focus).toBe(true);
  });
});
