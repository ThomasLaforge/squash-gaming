import type { ShotAction } from './types';

/**
 * Mapping périphérique → actions sémantiques.
 * Les codes bruts (KeyboardEvent.code, indices de boutons manette) restent
 * du côté de l'adaptateur ; le gameplay ne les connaît pas (ADR 0004).
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

/** Clavier WQSD/EUSA : WASD, Espace = length, Maj = drop, E = lob, Q = push, F = focus. */
export const DEFAULT_KEYBOARD_MAPPING: KeyboardMapping = {
  movement: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD' },
  shots: { Space: 'length', ShiftLeft: 'drop', KeyE: 'lob', KeyQ: 'push' },
  effort: {},
  focus: 'KeyF'
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
 * Applique une dead zone radiale non normalisée : l'amplitude de sortie
 * est proportionnelle à (magnitude − seuil), pas à l'angle. Un stick à
 * mi-course (magnitude 0.5) sort donc mi-course, quel que soit son angle.
 * Zéro sous le seuil.
 */
export function applyDeadZone(x: number, y: number, deadZone: number): { x: number; y: number } {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= deadZone) return { x: 0, y: 0 };
  return { x: x - (x / magnitude) * deadZone, y: y - (y / magnitude) * deadZone };
}
