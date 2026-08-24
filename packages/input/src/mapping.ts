import type { ShotAction } from './types';

/**
 * Mapping périphérique → actions sémantiques.
 * Les touches logiques du clavier (KeyboardEvent.key) et les indices de
 * boutons de manette restent du côté des adaptateurs ; le gameplay ne les
 * connaît pas (ADR 0004).
 */
interface ActionMapping {
  shots: Partial<Record<string, ShotAction>>;
  /** +1 monte l'effort, -1 le descend. */
  effort: Partial<Record<string, 1 | -1>>;
  focus: string | null;
}

export interface KeyboardMapping extends ActionMapping {
  movement?: { up: string; down: string; left: string; right: string };
  aim?: { up: string; down: string; left: string; right: string };
}

export interface GamepadMapping extends ActionMapping {
  axes: {
    movement: { x: number; y: number };
    aim: { x: number; y: number };
  };
}

/** Clavier AZERTY : ZQSD, Espace = length, Maj = drop, E = lob, R = push, F = focus. */
export const DEFAULT_KEYBOARD_MAPPING: KeyboardMapping = {
  movement: { up: 'z', down: 's', left: 'q', right: 'd' },
  shots: { ' ': 'length', Shift: 'drop', e: 'lob', r: 'push' },
  effort: {},
  focus: 'f'
};

/** Manette standard : stick gauche pour le déplacement, stick droit pour la visée. */
export const DEFAULT_GAMEPAD_MAPPING: GamepadMapping = {
  axes: {
    movement: { x: 0, y: 1 },
    aim: { x: 2, y: 3 }
  },
  shots: { 'standard:0': 'length', 'standard:1': 'drop', 'standard:2': 'lob', 'standard:3': 'push' },
  effort: { 'standard:6': -1, 'standard:7': 1 },
  focus: 'standard:4'
};

/**
 * Applique une dead zone radiale puis renormalise l'amplitude restante sur
 * [0, 1]. Ainsi une direction pleine course au clavier et à la manette
 * produisent la même amplitude sémantique.
 */
export function applyDeadZone(x: number, y: number, deadZone: number): { x: number; y: number } {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= deadZone) return { x: 0, y: 0 };
  const normalizedMagnitude = Math.min(1, (magnitude - deadZone) / (1 - deadZone));
  return { x: (x / magnitude) * normalizedMagnitude, y: (y / magnitude) * normalizedMagnitude };
}
