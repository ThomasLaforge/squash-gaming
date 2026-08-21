import { PlayerInput, SimulationState, GameEvent, RenderSnapshot } from './types';

const TRIVIAL_MOVEMENT_SPEED = 5;

export class Simulation {
  private state: SimulationState;
  private readonly dt: number;
  private listeners: ((e: GameEvent) => void)[] = [];

  constructor(initialState?: Partial<SimulationState>, hz = 120) {
    this.dt = 1 / hz;
    this.state = {
      tick: 0,
      time: 0,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      ...initialState
    };
  }

  public addEventListener(listener: (e: GameEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: GameEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public getState(): SimulationState {
    return {
      tick: this.state.tick,
      time: this.state.time,
      position: { ...this.state.position },
      velocity: { ...this.state.velocity }
    };
  }

  public getSnapshot(): RenderSnapshot {
    return {
      tick: this.state.tick,
      time: this.state.time,
      position: { ...this.state.position }
    };
  }

  public tick(input: PlayerInput): GameEvent[] {
    const tickEvents: GameEvent[] = [];
    const localEmit = (e: GameEvent) => {
      tickEvents.push(e);
      this.emit(e);
    };

    this.state.tick += 1;
    this.state.time += this.dt;

    // M0 ne donne encore aucun effet de gameplay à effort, focus ou shot.
    this.state.velocity.x = input.movement.x * TRIVIAL_MOVEMENT_SPEED;
    this.state.velocity.y = input.movement.y * TRIVIAL_MOVEMENT_SPEED;

    this.state.position.x += this.state.velocity.x * this.dt;
    this.state.position.y += this.state.velocity.y * this.dt;

    localEmit({ type: 'TICK', tick: this.state.tick, time: this.state.time });

    return tickEvents;
  }
}
