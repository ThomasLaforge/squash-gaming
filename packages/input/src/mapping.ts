import type { ShotAction, StickDirection } from './types';

/**
 * Mapping périphérique → actions sémantiques.
 * Les codes bruts (KeyboardEvent.code, indices de boutons manette) restent
 * du côté de l'adaptateur ; le gameplay ne les connaît pas (ADR 0004).
 */
export interface DeviceMapping {
  sticks: {
    movement?: { up: string; down: string; left: string; right: string };
    aim?: { up: string; down: string; left: string; right: string };
  };
  shots: Partial<Record<string, ShotAction>>;
  /** +1 monte l'effort, -1 le descend. */
  effort: Partial<Record<string, 1 | -1>>;
  focus: string | null;
}

/** Clavier WQSD/EUSA : WASD, Espace = length, Maj = drop, E = lob, Q = push, F = focus. */
export const DEFAULT_KEYBOARD_MAPPING: DeviceMapping = {
  sticks: { movement: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD' } },
  shots: { Space: 'length', ShiftLeft: 'drop', KeyE: 'lob', KeyQ: 'push' },
  effort: {},
  focus: 'KeyF'
};

/** Manette standard : croix directionnelle pour le déplacement, stick droit pour la visée. */
export const DEFAULT_GAMEPAD_MAPPING: DeviceMapping = {
  sticks: {
    movement: { up: 'standard:1', down: 'standard:2', left: 'standard:3', right: 'standard:4' },
    aim: { up: 'standard:5', down: 'standard:6', left: 'standard:7', right: 'standard:8' }
  },
  shots: { 'standard:10': 'length', 'standard:11': 'drop', 'standard:12': 'lob', 'standard:13': 'push' },
  effort: { 'standard:6': 1 },
  focus: 'standard:9'
};

/** Convertit une direction de stick en vectoriel unitaire (axe Y : haut négatif). */
export function directionVector(direction: StickDirection): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
}

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
