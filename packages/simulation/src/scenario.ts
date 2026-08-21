import { Simulation } from './simulation';
import type { GameEvent, PlayerInput, Scenario, SimulationState } from './types';

const EMPTY_INPUT: PlayerInput = {
  movement: { x: 0, y: 0 },
  aim: { x: 0, y: 0 },
  shot: null,
  effort: 0,
  focus: false
};

export interface ScenarioResult {
  finalState: SimulationState;
  events: GameEvent[];
}

/** Exécute un scénario versionné sans navigateur ni horloge système. */
export async function runScenario(scenario: Scenario): Promise<ScenarioResult> {
  const simulation = await Simulation.create({
    position: scenario.position,
    velocity: scenario.velocity
  });
  const events: GameEvent[] = [];
  const unsubscribe = simulation.onEvent((event) => events.push(event));
  const inputs = new Map(scenario.inputs?.map((entry) => [entry.tick, entry.input]) ?? []);

  try {
    for (let tick = 0; tick < scenario.durationTicks; tick += 1) {
      simulation.step(inputs.get(tick) ?? EMPTY_INPUT);
    }
    const finalState = simulation.getState();
    scenario.assertions(finalState, events);
    return { finalState, events };
  } finally {
    unsubscribe();
    simulation.dispose();
  }
}
