import type { PlayerInput, ShotIntent } from '@squash-gaming/simulation';
import type { GameAction, InputFrame, ShotAction } from './types';
import { EMPTY_INPUT_FRAME } from './types';

export interface InputStateOptions {
  /** Fréquence de la simulation : sert à convertir les temps en tick. */
  simulationHz: number;
  /** Horloge injectée (déterminisme) ; défaut neutre à zéro. */
  now?: () => number;
}

/**
 * Réagregate les événements sémantiques (`GameAction`) en un échantillon
 * par tick de simulation et tient l'état minimal (axes, focus, coup en cours).
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
  private readonly simHz: number;
  private readonly now: () => number;

  constructor(options: InputStateOptions) {
    this.simHz = options.simulationHz;
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
        this.effortDelta += action.value;
        break;
      case 'focus':
        this.focus = action.pressed;
        break;
    }
  }

  /**
   * Produit l'échantillon sémantique du tick courant et consomme les edges
   * et le delta d'effort. À appeler une fois par `Simulation.tick`.
   * M0 expose seulement la demande d'effort ; son effet sera défini plus tard.
   */
  public sample(): InputFrame {
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
  }
}

/**
 * Construit le `PlayerInput` de la simulation à partir de l'échantillon
 * sémantique. Au M0, effort reste neutre et aucune frappe n'est exécutée ;
 * les demandes correspondantes restent observables dans `InputFrame`.
 */
export function toPlayerInput(frame: InputFrame): PlayerInput {
  return {
    movement: { ...frame.movement },
    aim: { ...frame.aim },
    shot: null,
    effort: 0.5,
    focus: frame.focus
  };
}

export { EMPTY_INPUT_FRAME };
