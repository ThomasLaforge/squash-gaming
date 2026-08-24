import type { InterceptionEstimate, PlayerState, Vec3 } from '@squash-gaming/simulation';

interface PlayerStatsCardProps {
  player: PlayerState;
  interception: InterceptionEstimate;
}

function formatVector(position: Vec3): string {
  return `x = ${position.x.toFixed(3)} · y = ${position.y.toFixed(3)} · z = ${position.z.toFixed(3)}`;
}

function formatStance(stance: PlayerState['stance']): string {
  if (stance === 'lunging') return 'Fente';
  if (stance === 'moving') return 'Déplacement';
  return 'À l’appui';
}

export function PlayerStatsCard({ player, interception }: PlayerStatsCardProps) {
  return (
    <section className="stats-card" aria-label="État du joueur">
      <p className="card-kicker">Placement</p>
      <h2>État du joueur</h2>
      <div className="stats-grid">
        <div className="stat-row">
          <span>Appui</span>
          <strong data-testid="player-stance">{formatStance(player.stance)}</strong>
        </div>
        <div className="stat-row">
          <span>Support</span>
          <strong data-testid="player-support">{player.support}</strong>
        </div>
        <div className="stat-row">
          <span>Distance cible</span>
          <strong data-testid="interception-distance">{interception.distance.toFixed(2)} m</strong>
        </div>
        <div className="stat-row">
          <span>Retour au T</span>
          <strong data-testid="distance-to-t">{player.distanceToT.toFixed(2)} m</strong>
        </div>
        <div className="stat-row">
          <span>Temps d’arrivée</span>
          <strong data-testid="interception-time">{interception.time.toFixed(2)} s</strong>
        </div>
        <div className="stat-row" data-testid="player-position">
          <span>Position joueur</span>
          <strong>{formatVector(player.position)}</strong>
        </div>
        <div className="stat-row">
          <span>Cible</span>
          <strong>{interception.reachable ? 'Accessible' : 'Hors marge'}</strong>
        </div>
      </div>
    </section>
  );
}
