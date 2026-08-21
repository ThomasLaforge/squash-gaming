import type { PlayerInput, ShotIntent } from '@squash-gaming/simulation';
import type { GameAction, InputFrame, ShotAction } from './types';
import { EMPTY_INPUT_FRAME } from './types';

export interface InputStateOptions {
  /** Fréquence de la simulation : sert à convertir les temps en tick. */
  simulationHz: number;
  /**
   * Vitesse de variation de l'effort quand une gâchette est maintenue,
   * en unités d'effort par seconde. L'effort est borné à [0, 1].
   */
  effortSpeed?: number;
  /** Horloge injectée (déterminisme) ; défaut : horloge de performance si disponible. */
  now?: () => number;
}

/**
 * Réagregate les événements sémantiques (`GameAction`) en un échantillon
 * par tick de simulation et tient l'état des actions (effort, focus, coup en cours).
 *
 * Les sources (clavier, manette, replay, IA) décident seules quelles
 * `GameAction` émettre ; cet état ne connaît aucun code de périphérique (ADR 0004).
 */
export class InputState {
  private movement = { x: 0, y: 0 };
  private aim = { x: 0, y: 0 };
  private shotEdges: ShotAction[] = [];
  private effortDelta = 0;
  private focus = false;

  private activeShot: { type: ShotAction; pressedAtTick: number } | null = null;
  private effort = 0.5;

  private readonly simHz: number;
  private readonly effortSpeed: number;
  private readonly now: () => number;

  constructor(options: InputStateOptions) {
    this.simHz = options.simulationHz;
    this.effortSpeed = options.effortSpeed ?? 1;
    this.now = options.now ?? (() => 0);
  }

  /**
   * Applique un événement sémantique. Les événements d'axe écrasent la
   * dernière position ; les edges de coup s'accumulent jusqu'au prochain sample.
   */
  public apply(action: GameAction): void {
    switch (action.kind) {
      case 'axis':
        if (action.axis === 'movement') this.movement = { x: action.x, y: action.y };
        else this.aim = { x: action.x, y: action.y };
        break;
      case 'press-shot':
        this.activeShot = { type: action.shot, pressedAtTick: Math.round(this.now() * this.simHz) };
        if (!this.shotEdges.includes(action.shot)) {
          this.shotEdges = [...this.shotEdges, action.shot];
        }
        break;
      case 'release-shot':
        this.activeShot = null;
        break;
      case 'effort':
        this.effortDelta += action.value * this.effortSpeed;
        break;
      case 'focus':
        this.focus = action.pressed;
        break;
    }
  }

  /**
   * Produit l'échantillon sémantique du tick courant et consomme les edges
   * et le delta d'effort. À appeler une fois par `Simulation.tick`.
   * L'effort interne est mis à jour avant l'échantillon : la trame porte
   * l'effort effectif du tick, pas celui du tick précédent.
   */
  public sample(): InputFrame {
    this.effort = clamp01(this.effort + this.effortDelta / this.simHz);
    const frame: InputFrame = {
      movement: { ...this.movement },
      aim: { ...this.aim },
      shotEdges: this.shotEdges,
      effortDelta: this.effortDelta,
      focus: this.focus
    };
    this.shotEdges = [];
    this.effortDelta = 0;
    return frame;
  }

  /**
   * Le dernier coup pressé (ou encore pressé) depuis le dernier `sample()`,
   * prêt à être passé en `ShotIntent` à la simulation.
   * Retourne null si aucune intention n'est active.
   */
  public takeShotIntent(): ShotIntent | null {
    if (!this.activeShot) return null;
    const { type, pressedAtTick } = this.activeShot;
    this.activeShot = null;
    return { type, requestedAtTick: pressedAtTick, releasedAtTick: null };
  }

  public getEffort(): number {
    return this.effort;
  }

  public getFocus(): boolean {
    return this.focus;
  }

  public reset(): void {
    this.movement = { x: 0, y: 0 };
    this.aim = { x: 0, y: 0 };
    this.shotEdges = [];
    this.effortDelta = 0;
    this.focus = false;
    this.activeShot = null;
    this.effort = 0.5;
  }
}

/**
 * Construit le `PlayerInput` de la simulation à partir de l'échantillon
 * sémantique. L'effort et l'intention de frappe sont portés à part,
 * la simulation reçoit les deux au même tick.
 */
export function toPlayerInput(frame: InputFrame, effort: number): PlayerInput {
  return {
    movement: { ...frame.movement },
    aim: { ...frame.aim },
    shot: null,
    effort,
    focus: frame.focus
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export { EMPTY_INPUT_FRAME };
