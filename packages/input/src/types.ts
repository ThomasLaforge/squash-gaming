/**
 * Contrat sémantique commun, indépendant du périphérique (ADR 0004).
 * Les événements bruts (touches, boutons, axes) ne traversent jamais cette frontière.
 */

/** Types de coups sémantiques (leurs mécaniques arrivent au M3). */
export type ShotAction = 'length' | 'drop' | 'lob' | 'push';

/** Événement sémantique émis par un adaptateur en réaction à un périphérique. */
export type GameAction =
  /** Position d'un stick, valeurs normalisées [-1, 1], dead zone appliquée. */
  | { kind: 'axis'; axis: 'movement' | 'aim'; x: number; y: number }
  /** Appui d'un coup (edge de montée). */
  | { kind: 'press-shot'; shot: ShotAction }
  /** Relâchement d'un coup (edge de descente). */
  | { kind: 'release-shot' }
  /** Direction de variation de l'effort demandée par une gâchette. */
  | { kind: 'effort'; value: number }
  /** Appui ou relâchement du focus. */
  | { kind: 'focus'; pressed: boolean };

/**
 * Échantillon sémantique sur un tick de simulation.
 * `PlayerInput` (simulation) s'en dérive par `toPlayerInput` avec la dernière frappe en cours.
 */
export interface InputFrame {
  movement: { x: number; y: number };
  aim: { x: number; y: number };
  /** Coups pressés pendant le tick (edge) : à consommer comme `ShotIntent`. */
  shotEdges: ShotAction[];
  /** Variation d'effort demandée sur le tick (gâchette : + monte, - descend). */
  effortDelta: number;
  focus: boolean;
}

export const EMPTY_INPUT_FRAME: InputFrame = {
  movement: { x: 0, y: 0 },
  aim: { x: 0, y: 0 },
  shotEdges: [],
  effortDelta: 0,
  focus: false
};
