import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GAMEPAD_MAPPING,
  DEFAULT_KEYBOARD_MAPPING,
  applyDeadZone
} from '../src';

describe('Mappings par défaut', () => {
  it('le clavier mappe ZQSD vers le mouvement, quatre coups, et un focus', () => {
    const m = DEFAULT_KEYBOARD_MAPPING;
    expect(m.movement?.up).toBe('z');
    expect(m.movement?.down).toBe('s');
    expect(m.movement?.left).toBe('q');
    expect(m.movement?.right).toBe('d');
    expect(Object.values(m.shots).sort()).toEqual(['drop', 'length', 'lob', 'push']);
    expect(m.shots.q).toBeUndefined();
    expect(m.focus).toBe('f');
    // Le clavier ne porte pas la visée (M3) : pas de stick de visée mappé.
    expect(m.aim).toBeUndefined();
  });

  it('la manette mappe les deux sticks, les boutons de face et les gâchettes', () => {
    const m = DEFAULT_GAMEPAD_MAPPING;
    expect(m.axes.movement).toEqual({ x: 0, y: 1 });
    expect(m.axes.aim).toEqual({ x: 2, y: 3 });
    expect(Object.values(m.shots).sort()).toEqual(['drop', 'length', 'lob', 'push']);
    expect(m.effort['standard:6']).toBe(-1);
    expect(m.effort['standard:7']).toBe(1);
    expect(m.focus).toBe('standard:4');
  });
});

describe('Dead zone radiale', () => {
  it('sature à zéro sous le seuil', () => {
    expect(applyDeadZone(0.05, 0, 0.15)).toEqual({ x: 0, y: 0 });
    expect(applyDeadZone(0, 0.149, 0.15)).toEqual({ x: 0, y: 0 });
  });

  it('renormalise la course après la dead zone, quel que soit l’angle', () => {
    expect(applyDeadZone(1, 0, 0.15)).toEqual({ x: 1, y: 0 });
    expect(applyDeadZone(0, 1, 0.15)).toEqual({ x: 0, y: 1 });
    // Mi-course : l'amplitude restante est renormalisée sur [0, 1].
    const out = applyDeadZone(0.5, 0, 0.15);
    expect(out.x).toBeCloseTo(0.35 / 0.85, 6);
  });

  it('l’angle est préservé : un stick à 45° sort à 45°', () => {
    const out = applyDeadZone(0.7, 0.7, 0.15);
    expect(out.x).toBeCloseTo(out.y, 6);
    expect(out.x).toBeGreaterThan(0.65);
    expect(out.x).toBeLessThan(0.75);
  });
});
