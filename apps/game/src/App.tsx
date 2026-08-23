import { useEffect, useRef, useState } from 'react';
import { Simulation, type GameEvent, type Vec3 } from '@squash-gaming/simulation';

import { FixedStepAccumulator } from './fixed-step';
import { LAB_SCENARIOS, toSimulationInit, type LabScenario } from './lab-scenarios';
import {
  DEFAULT_CAMERA_DISTANCE,
  DEFAULT_CAMERA_HEIGHT,
  MAX_CAMERA_DISTANCE,
  MIN_CAMERA_DISTANCE,
  SimulationScene,
  type CourtTheme,
  type ImpactMarker
} from './scene/SimulationScene';
import './app.css';

const SIMULATION_HZ = 120;
const DEFAULT_SCENARIO = LAB_SCENARIOS[0] as LabScenario;

function createFixedStepLoop(
  hz: number,
  onStep: () => void,
  onFrame: () => void
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
    onFrame();
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
  const [selectedScenarioId, setSelectedScenarioId] = useState(DEFAULT_SCENARIO.id);
  const [tick, setTick] = useState(0);
  const [position, setPosition] = useState(DEFAULT_SCENARIO.position);
  const [speed, setSpeed] = useState(0);
  const [lastEvent, setLastEvent] = useState<GameEvent['type'] | '—'>('—');
  const [trail, setTrail] = useState<Vec3[]>([DEFAULT_SCENARIO.position]);
  const [impacts, setImpacts] = useState<ImpactMarker[]>([]);
  const [paused, setPaused] = useState(false);
  const [courtTheme, setCourtTheme] = useState<CourtTheme>('glass');
  const [cameraHeight, setCameraHeight] = useState(DEFAULT_CAMERA_HEIGHT);
  const [cameraDistance, setCameraDistance] = useState(DEFAULT_CAMERA_DISTANCE);
  const impactSequenceRef = useRef(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const simRef = useRef<Simulation | null>(null);
  const loopRef = useRef<{ stop: () => void } | null>(null);
  const selectedScenario = LAB_SCENARIOS.find(({ id }) => id === selectedScenarioId) ?? DEFAULT_SCENARIO;

  const refresh = (simulation: Simulation) => {
    const snapshot = simulation.getRenderSnapshot();
    setTick(snapshot.tick);
    setPosition(snapshot.position);
    setSpeed(snapshot.speed);
    setTrail((points) => [...points.slice(-179), snapshot.position]);
  };

  const onStep = () => {
    const simulation = simRef.current;
    if (!simulation || pausedRef.current) return;
    simulation.step();
    refresh(simulation);
  };
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    let disposed = false;
    let simulation: Simulation | null = null;
    let unsubscribe: (() => void) | undefined;

    void Simulation.create(toSimulationInit(DEFAULT_SCENARIO)).then((created) => {
      if (disposed) {
        created.dispose();
        return;
      }
      simulation = created;
      simRef.current = created;
      unsubscribe = created.onEvent((event) => {
        if (event.type !== 'TICK') {
          setLastEvent(event.type);
          const id = impactSequenceRef.current;
          impactSequenceRef.current += 1;
          setImpacts((markers) => [...markers.slice(-79), { id, type: event.type, point: event.point }]);
        }
      });
      refresh(created);
      const loop = createFixedStepLoop(
        SIMULATION_HZ,
        () => onStepRef.current(),
        () => {
          if (!pausedRef.current) refreshRef.current(created);
        }
      );
      loopRef.current = loop;
      loop.start();
    });

    return () => {
      disposed = true;
      loopRef.current?.stop();
      loopRef.current = null;
      simRef.current = null;
      unsubscribe?.();
      simulation?.dispose();
    };
  }, []);

  const reset = () => {
    const simulation = simRef.current;
    if (!simulation) return;
    simulation.reset(selectedScenario.position, selectedScenario.velocity);
    setLastEvent('—');
    setTrail([selectedScenario.position]);
    setImpacts([]);
    refresh(simulation);
  };

  const selectScenario = (scenarioId: string) => {
    const scenario = LAB_SCENARIOS.find(({ id }) => id === scenarioId);
    const simulation = simRef.current;
    if (!scenario) return;

    setSelectedScenarioId(scenario.id);
    if (!simulation) return;

    simulation.reset(scenario.position, scenario.velocity);
    setLastEvent('—');
    setTrail([scenario.position]);
    setImpacts([]);
    refresh(simulation);
  };

  const stepOnce = () => {
    const simulation = simRef.current;
    if (!simulation) return;
    simulation.step();
    refresh(simulation);
  };

  return (
    <main className="lab-shell" data-testid="app">
      <header className="lab-header">
        <div>
          <p className="eyebrow">M1 · laboratoire de physique</p>
          <h1>Squash Gaming</h1>
          <p className="lab-subtitle">Simulation Rapier headless · pas fixe {SIMULATION_HZ} Hz · vue arrière centrée</p>
        </div>
        <span className="live-indicator">Simulation active</span>
      </header>

      <div className="lab-content">
        <section className="court-card" aria-label="Vue physique du court">
          <div className="court-card-header">
            <div>
              <p className="card-kicker">Vue du court</p>
              <h2>{selectedScenario.name}</h2>
            </div>
            <span className="live-indicator">{paused ? 'En pause' : 'En lecture'}</span>
          </div>

          <div className="court-stage">
            <SimulationScene theme={courtTheme} cameraHeight={cameraHeight} cameraDistance={cameraDistance} position={position} trail={trail} impacts={impacts} />
            <div className="stats-overlay" aria-label="Statistiques principales">
              <div className="stat-pill">
                <span>Vitesse</span>
                <strong>{speed.toFixed(2)} m/s</strong>
              </div>
              <div className="stat-pill">
                <span>Hauteur</span>
                <strong>{position.z.toFixed(2)} m</strong>
              </div>
              <div className="stat-pill">
                <span>Impact</span>
                <strong>{lastEvent}</strong>
              </div>
            </div>
          </div>
          <div className="court-caption">
            <span>Orange : balle · ligne : trajectoire · points : impacts</span>
            <span>Tick {tick}</span>
          </div>
        </section>

        <aside className="lab-sidebar">
          <section className="control-card" aria-label="Contrôles du laboratoire">
            <div className="control-card-header">
              <div>
                <p className="card-kicker">Configuration</p>
                <h2>Préparer un test</h2>
              </div>
            </div>

            <label className="control-label" htmlFor="scenario-select">
              Scénario
              <select
                id="scenario-select"
                value={selectedScenario.id}
                onChange={(event) => selectScenario(event.target.value)}
                data-testid="scenario-select"
              >
                {LAB_SCENARIOS.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="scenario-description" data-testid="scenario-description">
              {selectedScenario.description}
            </p>

            <span className="theme-label">Type de court</span>
            <div className="segmented-control" aria-label="Type de court">
              <button
                type="button"
                aria-pressed={courtTheme === 'glass'}
                data-testid="theme-glass"
                onClick={() => setCourtTheme('glass')}
              >
                Vitré
              </button>
              <button
                type="button"
                aria-pressed={courtTheme === 'indoor'}
                data-testid="theme-indoor"
                onClick={() => setCourtTheme('indoor')}
              >
                Intérieur
              </button>
            </div>

            <div className="slider-control">
              <span className="theme-label" data-testid="camera-height-label">Hauteur de caméra</span>
              <div className="slider-row" role="group" aria-label="Position verticale de la caméra">
                <button
                  type="button"
                  data-testid="camera-height-lower"
                  onClick={() => setCameraHeight((value) => Math.max(0.6, value - 0.6))}
                  aria-label="Baisser la caméra"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0.6}
                  max={7}
                  step={0.1}
                  value={cameraHeight}
                  data-testid="camera-height-range"
                  aria-label="Position verticale de la caméra"
                  aria-valuetext={`${cameraHeight.toFixed(1)} m`}
                  onChange={(event) => setCameraHeight(Number(event.target.value))}
                />
                <button
                  type="button"
                  data-testid="camera-height-raiser"
                  onClick={() => setCameraHeight((value) => Math.min(7, value + 0.6))}
                  aria-label="Monter la caméra"
                >
                  +
                </button>
              </div>
              <span className="slider-value" data-testid="camera-height-value">
                {cameraHeight.toFixed(1)} m
              </span>
            </div>

            <div className="slider-control">
              <span className="theme-label" data-testid="camera-distance-label">Distance à la vitre</span>
              <div className="slider-row" role="group" aria-label="Distance horizontale de la caméra">
                <button
                  type="button"
                  data-testid="camera-distance-closer"
                  onClick={() => setCameraDistance((value) => Math.max(MIN_CAMERA_DISTANCE, value - 0.8))}
                  aria-label="Rapprocher de la vitre"
                >
                  −
                </button>
                <input
                  type="range"
                  min={MIN_CAMERA_DISTANCE}
                  max={MAX_CAMERA_DISTANCE}
                  step={0.1}
                  value={cameraDistance}
                  data-testid="camera-distance-range"
                  aria-label="Distance horizontale de la caméra"
                  aria-valuetext={`${cameraDistance.toFixed(1)} m`}
                  onChange={(event) => setCameraDistance(Number(event.target.value))}
                />
                <button
                  type="button"
                  data-testid="camera-distance-far"
                  onClick={() => setCameraDistance((value) => Math.min(MAX_CAMERA_DISTANCE, value + 0.8))}
                  aria-label="Éloigner de la vitre"
                >
                  +
                </button>
              </div>
              <span className="slider-value" data-testid="camera-distance-value">
                {cameraDistance.toFixed(1)} m
              </span>
            </div>

            <div className="action-row">
              <button type="button" onClick={() => setPaused((value) => !value)} data-testid="pause-toggle">
                {paused ? 'Reprendre' : 'Pause'}
              </button>
              <button type="button" onClick={stepOnce} data-testid="step-once">
                Pas suivant
              </button>
              <button type="button" onClick={reset} data-testid="reset">
                Réinitialiser le scénario
              </button>
            </div>
          </section>

          <section className="stats-card" aria-label="État détaillé de la balle">
            <p className="card-kicker">Mesures</p>
            <h2>État de la balle</h2>
            <div className="stats-grid">
              <div className="stat-row speed-row">
                <span>Vitesse instantanée</span>
                <strong data-testid="speed">{speed.toFixed(3)} m/s</strong>
              </div>
              <div className="stat-row">
                <span>Tick</span>
                <strong data-testid="tick">{tick}</strong>
              </div>
              <div className="stat-row">
                <span>Dernier impact</span>
                <strong data-testid="last-event">{lastEvent}</strong>
              </div>
              <div className="stat-row" data-testid="position">
                <span>Position</span>
                <strong>{formatVector(position)}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
