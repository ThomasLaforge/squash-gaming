import { describe, expect, it } from 'vitest';

import {
  PLAYER_MAX_X,
  PLAYER_MAX_Y,
  PLAYER_MIN_X,
  PLAYER_MIN_Y,
  Simulation,
  T_POSITION,
  type PlayerInput,
  type Vec3
} from '../src';

const EMPTY_INPUT: PlayerInput = {
  movement: { x: 0, y: 0 },
  aim: { x: 0, y: 0 },
  shot: null,
  effort: 0,
  focus: false
};

const FORWARD_INPUT: PlayerInput = { ...EMPTY_INPUT, movement: { x: 0, y: -1 } };

describe('Simulation M2 — déplacement et interception', () => {
  it('accélère puis freine le joueur à pas fixe', async () => {
    const simulation = await Simulation.create({
      position: { x: 2, y: 0, z: 2 },
      velocity: { x: 2, y: 0, z: 1 }
    });

    for (let tick = 0; tick < 30; tick += 1) simulation.step(FORWARD_INPUT);
    const moving = simulation.getPlayerState();
    expect(moving.position.x).toBeLessThan(5.49);
    expect(Math.hypot(moving.velocity.x, moving.velocity.y)).toBeGreaterThan(0);

    for (let tick = 0; tick < 180; tick += 1) simulation.step(EMPTY_INPUT);
    const stopped = simulation.getPlayerState();
    expect(Math.hypot(stopped.velocity.x, stopped.velocity.y)).toBeLessThan(0.1);
    simulation.dispose();
  });

  it('maintient le joueur à l’intérieur des limites du court', async () => {
    const simulation = await Simulation.create({
      position: { x: 2, y: 0, z: 2 },
      velocity: { x: 0, y: 0, z: 0 },
      playerPosition: { x: PLAYER_MAX_X, y: PLAYER_MAX_Y, z: 0 }
    });

    for (let tick = 0; tick < 180; tick += 1) simulation.step({ ...EMPTY_INPUT, movement: { x: 1, y: 1 } });
    const state = simulation.getPlayerState();
    expect(state.position.x).toBeLessThanOrEqual(PLAYER_MAX_X);
    expect(state.position.y).toBeLessThanOrEqual(PLAYER_MAX_Y);

    simulation.reset(undefined, undefined, { x: PLAYER_MIN_X, y: PLAYER_MIN_Y, z: 0 });
    for (let tick = 0; tick < 180; tick += 1) simulation.step({ ...EMPTY_INPUT, movement: { x: -1, y: -1 } });
    const resetState = simulation.getPlayerState();
    expect(resetState.position.x).toBeGreaterThanOrEqual(PLAYER_MIN_X);
    expect(resetState.position.y).toBeGreaterThanOrEqual(PLAYER_MIN_Y);
    simulation.dispose();
  });

  it('calcule une cible d’interception déterministe et bornée', async () => {
    const init = {
      position: { x: 3, y: -2, z: 1.4 },
      velocity: { x: 4, y: 3, z: -1 }
    } satisfies { position: Vec3; velocity: Vec3 };
    const first = await Simulation.create(init);
    const second = await Simulation.create(init);

    for (let tick = 0; tick < 20; tick += 1) {
      first.step(EMPTY_INPUT);
      second.step(EMPTY_INPUT);
    }

    expect(first.getRenderSnapshot().interception).toEqual(second.getRenderSnapshot().interception);
    const target = first.getRenderSnapshot().interception;
    expect(target.position.x).toBeGreaterThanOrEqual(PLAYER_MIN_X);
    expect(target.position.x).toBeLessThanOrEqual(PLAYER_MAX_X);
    expect(target.position.y).toBeGreaterThanOrEqual(PLAYER_MIN_Y);
    expect(target.position.y).toBeLessThanOrEqual(PLAYER_MAX_Y);
    first.dispose();
    second.dispose();
  });

  it('garde le regard vers le front en reculant', async () => {
    const simulation = await Simulation.create({
      position: { x: 3, y: 0, z: 2 },
      velocity: { x: 0, y: 0, z: 0 }
    });
    const initialFacing = simulation.getPlayerState().facing;

    for (let tick = 0; tick < 60; tick += 1) {
      simulation.step({ ...EMPTY_INPUT, movement: { x: 0, y: 1 } });
    }

    expect(simulation.getPlayerState().facing).toBeCloseTo(initialFacing, 6);
    simulation.dispose();
  });

  it('revient progressivement face au frontal en pas chassé', async () => {
    const simulation = await Simulation.create({
      position: { x: 3, y: 0, z: 2 },
      velocity: { x: 0, y: 0, z: 0 }
    });

    for (let tick = 0; tick < 60; tick += 1) {
      simulation.step({ ...EMPTY_INPUT, movement: { x: -1, y: -1 } });
    }
    const diagonalFacing = simulation.getPlayerState().facing;

    for (let tick = 0; tick < 60; tick += 1) {
      simulation.step({ ...EMPTY_INPUT, movement: { x: -1, y: 0 } });
    }
    const sidewaysFacing = simulation.getPlayerState().facing;

    expect(Math.abs(sidewaysFacing - Math.PI)).toBeLessThan(Math.abs(diagonalFacing - Math.PI));
    simulation.dispose();
  });

  it('aligne gauche et droite avec la vue arrière du court', async () => {
    const simulation = await Simulation.create({
      position: { x: 3, y: 0, z: 2 },
      velocity: { x: 0, y: 0, z: 0 }
    });

    for (let tick = 0; tick < 30; tick += 1) {
      simulation.step({ ...EMPTY_INPUT, movement: { x: -1, y: 0 } });
    }
    expect(simulation.getPlayerState().position.y).toBeGreaterThan(0);

    simulation.reset(undefined, undefined, { x: T_POSITION, y: 0, z: 0 });
    for (let tick = 0; tick < 30; tick += 1) {
      simulation.step({ ...EMPTY_INPUT, movement: { x: 1, y: 0 } });
    }
    expect(simulation.getPlayerState().position.y).toBeLessThan(0);
    simulation.dispose();
  });
});
