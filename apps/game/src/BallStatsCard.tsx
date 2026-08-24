import type { ShotResult, Vec3 } from '@squash-gaming/simulation';

interface BallStatsCardProps {
  position: Vec3;
  speed: number;
  tick: number;
  lastEvent: string;
  lastShot: ShotResult | null;
}

function formatVector(position: Vec3): string {
  return `x = ${position.x.toFixed(3)} · y = ${position.y.toFixed(3)} · z = ${position.z.toFixed(3)}`;
}

export function BallStatsCard({ position, speed, tick, lastEvent, lastShot }: BallStatsCardProps) {
  return (
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
        <div className="stat-row">
          <span>Dernier coup</span>
          <strong data-testid="last-shot">
            {lastShot
              ? `${lastShot.shot} · ${lastShot.accepted ? lastShot.timing : 'hors portée'} · ${Math.round(lastShot.quality * 100)}%`
              : '—'}
          </strong>
        </div>
        <div className="stat-row" data-testid="position">
          <span>Position</span>
          <strong>{formatVector(position)}</strong>
        </div>
      </div>
    </section>
  );
}
