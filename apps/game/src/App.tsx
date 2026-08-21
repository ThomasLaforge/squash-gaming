import { useEffect, useRef, useState } from 'react';
import { Simulation, type GameEvent, type Vec3 } from '@squash-gaming/simulation';

import { STATUS, type StatusKey } from './status';
import { FixedStepAccumulator } from './fixed-step';

const SIMULATION_HZ = 120;
const INITIAL_POSITION: Vec3 = { x: 3, y: 0, z: 1 };

function createFixedStepLoop(
  hz: number,
  onStep: () => void
): { start: () => void; stop: () => void; step: () => void } {
  const fixedStep = new FixedStepAccumulator(hz);
  let rafId: number | undefined;
  let lastTime: number | undefined;
  let running = false;

  const frame = (time: number) => {
    if (!running) return;
    if (lastTime === undefined) lastTime = time;
    const elapsed = time - lastTime;
    lastTime = time;
    fixedStep.advance(elapsed, onStep);
    rafId = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (running) return;
      running = true;
      lastTime = undefined;
      fixedStep.reset();
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      rafId = undefined;
      lastTime = undefined;
      fixedStep.reset();
    },
    step() {
      onStep();
    }
  };
}

function formatVector(position: Vec3): string {
  return `x = ${position.x.toFixed(3)} · y = ${position.y.toFixed(3)} · z = ${position.z.toFixed(3)}`;
}

export default function App() {
  const [tick, setTick] = useState(0);
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [speed, setSpeed] = useState(0);
  const [lastEvent, setLastEvent] = useState<GameEvent['type'] | '—'>('—');
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const simRef = useRef<Simulation | null>(null);
  const loopRef = useRef<{ stop: () => void } | null>(null);

  const refresh = (simulation: Simulation) => {
    const snapshot = simulation.getRenderSnapshot();
    setTick(snapshot.tick);
    setPosition(snapshot.position);
    setSpeed(snapshot.speed);
  };

  const onStep = () => {
    const simulation = simRef.current;
    if (!simulation || pausedRef.current) return;
    simulation.step();
    refresh(simulation);
  };
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  useEffect(() => {
    let disposed = false;
    let simulation: Simulation | null = null;

    void Simulation.create({ position: INITIAL_POSITION }).then((created) => {
      if (disposed) {
        created.dispose();
        return;
      }
      simulation = created;
      simRef.current = created;
      created.onEvent((event) => {
        if (event.type !== 'TICK') setLastEvent(event.type);
      });
      refresh(created);
      const loop = createFixedStepLoop(SIMULATION_HZ, () => onStepRef.current());
      loopRef.current = loop;
      loop.start();
    });

    return () => {
      disposed = true;
      loopRef.current?.stop();
      loopRef.current = null;
      simRef.current = null;
      simulation?.dispose();
    };
  }, []);

  const reset = () => {
    const simulation = simRef.current;
    if (!simulation) return;
    simulation.reset(INITIAL_POSITION);
    setLastEvent('—');
    refresh(simulation);
  };

  const stepOnce = () => {
    const simulation = simRef.current;
    if (!simulation) return;
    simulation.step();
    refresh(simulation);
  };

  const statusLines = (Object.entries(STATUS) as [StatusKey, boolean][]).map(
    ([key, ok]) => [key, ok ? 'OK' : 'À VENIR'] as const
  );

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        color: '#111',
        background: '#fafafa',
        minHeight: '100vh'
      }}
      data-testid="app"
    >
      <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem', fontWeight: 700 }}>
        Squash Gaming — Laboratoire M1
      </h1>
      <p style={{ margin: 0, opacity: 0.7 }}>
        Balle Rapier headless, court Z-up, pas fixe {SIMULATION_HZ} Hz.
      </p>

      <section
        style={{ marginTop: '1.5rem', display: 'grid', gap: '0.5rem', maxWidth: 480 }}
        data-testid="status"
        aria-label="Statut des briques du projet"
      >
        {statusLines.map(([key, label]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.4rem 0.75rem',
              borderRadius: 6,
              background: '#fff',
              border: '1px solid #e2e2e2'
            }}
          >
            <code>{key}</code>
            <span style={{ fontWeight: 600, opacity: 0.8 }}>{label}</span>
          </div>
        ))}
      </section>

      <section style={{ marginTop: '1.5rem', maxWidth: 560 }} aria-label="État de la balle">
        <h2 style={{ fontSize: '1rem', marginTop: 0 }}>État de la simulation</h2>
        <p data-testid="tick">tick = {tick}</p>
        <p data-testid="position">{formatVector(position)}</p>
        <p data-testid="speed">vitesse = {speed.toFixed(3)} m/s</p>
        <p data-testid="last-event">dernier événement = {lastEvent}</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={() => setPaused((value) => !value)} data-testid="pause-toggle">
            {paused ? 'Reprendre' : 'Pause'}
          </button>
          <button type="button" onClick={stepOnce} data-testid="step-once">
            Pas suivant
          </button>
          <button type="button" onClick={reset} data-testid="reset">
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
