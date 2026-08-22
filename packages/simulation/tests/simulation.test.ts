import { describe, expect, it } from 'vitest';

import {
  BALL_RADIUS,
  COURT_LENGTH,
  FRONT_OUT_HEIGHT,
  TIN_HEIGHT,
  Simulation,
  runScenario,
  type GameEvent,
  type Vec3
} from '../src';

const origin: Vec3 = { x: 3, y: 0, z: 1 };

function eventsOfType(events: GameEvent[], type: GameEvent['type']): GameEvent[] {
  return events.filter((event) => event.type === type);
}

describe('Simulation M1 — laboratoire physique', () => {
  it('initialise Rapier avec un état sérialisable et un pas fixe de 120 Hz', async () => {
    const simulation = await Simulation.create({ position: origin });

    expect(simulation.frequency).toBe(120);
    expect(simulation.getState()).toEqual({
      tick: 0,
      time: 0,
      position: origin,
      velocity: { x: 0, y: 0, z: 0 },
      floorContacts: 0
    });

    simulation.dispose();
  });

  it('fait tomber la balle et émet le premier puis le second rebond au sol', async () => {
    const simulation = await Simulation.create({ position: origin });
    const events: GameEvent[] = [];
    simulation.onEvent((event) => events.push(event));

    for (let tick = 0; tick < 600; tick += 1) simulation.step();

    const state = simulation.getState();
    expect(state.position.z).toBeGreaterThanOrEqual(BALL_RADIUS - 0.002);
    expect(state.floorContacts).toBeGreaterThanOrEqual(2);
    expect(eventsOfType(events, 'IMPACT').some((event) => event.type === 'IMPACT' && event.surface === 'sol')).toBe(true);
    expect(eventsOfType(events, 'SECOND_REBOND')).toHaveLength(1);

    simulation.dispose();
  });

  it('ralentit une balle qui roule sur le sol jusqu’à l’arrêt', async () => {
    const simulation = await Simulation.create({
      position: { x: 3, y: 0, z: BALL_RADIUS + 0.002 },
      velocity: { x: 4, y: 0, z: 0 }
    });

    for (let tick = 0; tick < 600; tick += 1) simulation.step();

    const state = simulation.getState();
    expect(state.position.z).toBeGreaterThanOrEqual(BALL_RADIUS - 0.002);
    expect(Math.hypot(state.velocity.x, state.velocity.y)).toBeLessThanOrEqual(0.03);
    simulation.dispose();
  });

  it('classe un contact frontal bas comme TIN', async () => {
    const simulation = await Simulation.create({
      position: { x: 2, y: 0, z: TIN_HEIGHT - 0.08 },
      velocity: { x: -20, y: 0, z: 0 }
    });
    const events: GameEvent[] = [];
    simulation.onEvent((event) => events.push(event));

    for (let tick = 0; tick < 60; tick += 1) simulation.step();

    expect(eventsOfType(events, 'TIN')).toHaveLength(1);
    simulation.dispose();
  });

  it('classe les impacts frontaux hauts et arrière hors limite comme OUT', async () => {
    const front = await Simulation.create({
      position: { x: 2, y: 0, z: FRONT_OUT_HEIGHT + 0.1 },
      velocity: { x: -20, y: 0, z: 0 }
    });
    const frontEvents: GameEvent[] = [];
    front.onEvent((event) => frontEvents.push(event));
    for (let tick = 0; tick < 60; tick += 1) front.step();

    const back = await Simulation.create({
      position: { x: COURT_LENGTH - 2, y: 0, z: 2.2 },
      velocity: { x: 20, y: 0, z: 0 }
    });
    const backEvents: GameEvent[] = [];
    back.onEvent((event) => backEvents.push(event));
    for (let tick = 0; tick < 60; tick += 1) back.step();

    expect(eventsOfType(frontEvents, 'OUT')).toHaveLength(1);
    expect(eventsOfType(backEvents, 'OUT')).toHaveLength(1);
    front.dispose();
    back.dispose();
  });

  it('émet un impact latéral ordinaire puis un OUT latéral au-dessus de la ligne', async () => {
    const ordinary = await Simulation.create({
      position: { x: 2, y: 0, z: 1 },
      velocity: { x: 0, y: 20, z: 0 }
    });
    const ordinaryEvents: GameEvent[] = [];
    ordinary.onEvent((event) => ordinaryEvents.push(event));
    for (let tick = 0; tick < 60; tick += 1) ordinary.step();

    const out = await Simulation.create({
      position: { x: 2, y: 0, z: 4.5 },
      velocity: { x: 0, y: 20, z: 0 }
    });
    const outEvents: GameEvent[] = [];
    out.onEvent((event) => outEvents.push(event));
    for (let tick = 0; tick < 60; tick += 1) out.step();

    expect(ordinaryEvents.some((event) => event.type === 'IMPACT' && event.surface === 'latere')).toBe(true);
    expect(eventsOfType(outEvents, 'OUT')).toHaveLength(1);
    ordinary.dispose();
    out.dispose();
  });

  it('ne traverse pas le mur frontal à 100 m/s avec CCD', async () => {
    const simulation = await Simulation.create({
      position: { x: 1, y: 0, z: 1 },
      velocity: { x: -100, y: 0, z: 0 }
    });
    const events: GameEvent[] = [];
    simulation.onEvent((event) => events.push(event));

    for (let tick = 0; tick < 30; tick += 1) simulation.step();

    const state = simulation.getState();
    expect(eventsOfType(events, 'IMPACT').some((event) => event.type === 'IMPACT' && event.surface === 'frontal')).toBe(true);
    expect(state.position.x).toBeGreaterThanOrEqual(BALL_RADIUS - 0.01);
    simulation.dispose();
  });

  it('rejoue le même scénario avec le même état final et les mêmes événements', async () => {
    const scenario = {
      name: 'rebond-sol-deterministe',
      position: origin,
      velocity: { x: 4, y: 1, z: 2 },
      durationTicks: 240,
      assertions: () => {}
    } as const;

    const first = await runScenario(scenario);
    const second = await runScenario(scenario);

    expect(second.finalState).toEqual(first.finalState);
    expect(second.events).toEqual(first.events);
  });
});
