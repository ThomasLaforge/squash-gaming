import { GHOSTING_ROUTE, type GhostingState } from '@squash-gaming/simulation';

interface GhostingPanelProps {
  ghosting: GhostingState;
  bestTime: number | null;
  onStart: () => void;
  onReset: () => void;
}

const SIMULATION_HZ = 120;

function formatTime(ticks: number): string {
  return `${(ticks / SIMULATION_HZ).toFixed(2)} s`;
}

export function GhostingPanel({ ghosting, bestTime, onStart, onReset }: GhostingPanelProps) {
  return (
    <div className="ghosting-card" data-testid="ghosting-panel">
      <p className="card-kicker">Mini-jeu M2</p>
      <h2>Ghosting · 6 déplacements</h2>
      <div className="ghosting-stats">
        <div>
          <span>Chrono</span>
          <strong data-testid="ghosting-time">{formatTime(ghosting.elapsedTicks)}</strong>
        </div>
        <div>
          <span>Progression</span>
          <strong data-testid="ghosting-progress">{ghosting.completedTargets}/{GHOSTING_ROUTE.length}</strong>
        </div>
        <div>
          <span>Objectif</span>
          <strong data-testid="ghosting-target">
            {ghosting.status === 'completed' ? 'Parcours terminé' : GHOSTING_ROUTE[ghosting.targetIndex]?.label}
          </strong>
        </div>
      </div>
      {bestTime !== null && <p className="ghosting-record">Record de session : {formatTime(bestTime)}</p>}
      <div className="action-row">
        <button type="button" onClick={onStart} data-testid="ghosting-start">
          {ghosting.status === 'running' ? 'Recommencer' : 'Démarrer'}
        </button>
        <button type="button" onClick={onReset} data-testid="ghosting-reset">
          Effacer
        </button>
      </div>
    </div>
  );
}
