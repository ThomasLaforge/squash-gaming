import { useEffect, useRef, useState } from 'react';
import { GamepadAdapter, KeyboardAdapter } from '@squash-gaming/input';
import { Simulation, type PlayerInput } from '@squash-gaming/simulation';

import { STATUS, type StatusKey } from './status';
import { FixedStepAccumulator } from './fixed-step';

const SIMULATION_HZ = 120;

/**
 * Puits de temps à pas fixe : la simulation avance à la cadence de simulation,
 * quel que soit le framerate de rendu (ADR 0002). Un retard est borné à 250 ms
 * pour éviter la spirale de la mort.
 */
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
    let elapsed = time - lastTime;
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

function isPadConnected(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.getGamepads === 'function' &&
    Array.from(navigator.getGamepads()).some((pad) => !!pad && pad.connected)
  );
}

export default function App() {
  const [tick, setTick] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const simRef = useRef<Simulation | null>(null);
  const keyboardRef = useRef<KeyboardAdapter | null>(null);
  const gamepadRef = useRef<GamepadAdapter | null>(null);

  const onStep = () => {
    const simulation = simRef.current;
    const keyboard = keyboardRef.current;
    const gamepad = gamepadRef.current;
    if (!simulation || !keyboard || !gamepad) return;
    if (pausedRef.current) return;

    // La manette prime quand elle est connectée ; sinon le clavier.
    const input: PlayerInput = isPadConnected() ? gamepad.samplePlayerInput() : keyboard.samplePlayerInput();
    simulation.tick(input);
    const state = simulation.getState();
    setTick(state.tick);
    setPosition(state.position);
  };
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  useEffect(() => {
    const simulation = new Simulation(undefined, SIMULATION_HZ);
    const now = () => performance.now() / 1000;
    const keyboard = new KeyboardAdapter({ simulationHz: SIMULATION_HZ, now });
    const gamepad = new GamepadAdapter({
      simulationHz: SIMULATION_HZ,
      now
    });
    simRef.current = simulation;
    keyboardRef.current = keyboard;
    gamepadRef.current = gamepad;

    keyboard.attach(window as unknown as Parameters<KeyboardAdapter['attach']>[0]);

    const loop = createFixedStepLoop(SIMULATION_HZ, () => onStepRef.current());
    loop.start();

    return () => {
      loop.stop();
      keyboard.detach(window as unknown as Parameters<KeyboardAdapter['attach']>[0]);
    };
  }, []);

  const reset = () => {
    const simulation = new Simulation(undefined, SIMULATION_HZ);
    simRef.current = simulation;
    keyboardRef.current?.reset();
    gamepadRef.current?.reset();
    setTick(0);
    setPosition({ x: 0, y: 0 });
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
        Squash Gaming — Bootstrap
      </h1>
      <p style={{ margin: 0, opacity: 0.7 }}>
        M0 : workspace pnpm, simulation headless, entrées clavier/manette, validation unique.
      </p>

      <section
        style={{ marginTop: '1.5rem', display: 'grid', gap: '0.5rem', maxWidth: 480 }}
        data-testid="status"
        aria-label="Statut des briques bootstrap"
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

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Simulation triviale (M0)</h2>
        <p style={{ margin: '0 0 0.5rem', opacity: 0.8, fontVariantNumeric: 'tabular-nums' }} data-testid="tick">
          tick = {tick}
        </p>
        <p style={{ margin: '0 0 0.5rem', opacity: 0.8, fontVariantNumeric: 'tabular-nums' }} data-testid="position">
          x = {position.x.toFixed(3)} · y = {position.y.toFixed(3)}
        </p>
        <p style={{ margin: '0 0 0.75rem', opacity: 0.6, fontSize: '0.85rem' }}>
          Déplacement : <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> — ou stick gauche
          (manette). Pas fixe {SIMULATION_HZ} Hz, indépendant du framerate.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}
            data-testid="pause-toggle"
          >
            {paused ? 'Reprendre' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={reset}
            style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}
            data-testid="reset"
          >
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
