import type { PlayerInput as SimPlayerInput, ShotIntent } from '@squash-gaming/simulation';
import { DEFAULT_KEYBOARD_MAPPING, type KeyboardMapping } from './mapping';
import { InputState, type InputStateOptions, toPlayerInput } from './state';
import type { GameAction, InputFrame } from './types';

export interface KeyboardAdapterOptions extends InputStateOptions {
  mapping?: KeyboardMapping;
  /** Reçoit les événements sémantiques émis (telemétrie, tests, UI). */
  onAction?: (action: GameAction) => void;
}

interface KeyTargetLike {
  addEventListener(type: 'keydown' | 'keyup', listener: (event: { code: string }) => void): void;
  removeEventListener(type: 'keydown' | 'keyup', listener: (event: { code: string }) => void): void;
}

/**
 * Adaptateur clavier : convertit les presses/releases de touches en
 * échantillons sémantiques. Les codes de touches restent ici, jamais dans
 * le gameplay (ADR 0004).
 */
export class KeyboardAdapter {
  public readonly state: InputState;

  private readonly mapping: KeyboardMapping;
  private readonly onAction?: (action: GameAction) => void;
  private readonly pressedCodes = new Set<string>();
  private readonly handleKeyDown: (event: { code: string }) => void;
  private readonly handleKeyUp: (event: { code: string }) => void;

  constructor(options: KeyboardAdapterOptions) {
    this.mapping = options.mapping ?? DEFAULT_KEYBOARD_MAPPING;
    this.onAction = options.onAction;
    this.state = new InputState(options);
    this.handleKeyDown = (event) => this.handleKey(event.code, true);
    this.handleKeyUp = (event) => this.handleKey(event.code, false);
  }

  public attach(target: KeyTargetLike): void {
    target.addEventListener('keydown', this.handleKeyDown);
    target.addEventListener('keyup', this.handleKeyUp);
  }

  public detach(target: KeyTargetLike): void {
    target.removeEventListener('keydown', this.handleKeyDown);
    target.removeEventListener('keyup', this.handleKeyUp);
    this.pressedCodes.clear();
  }

  /**
   * Appelé au rythme de la simulation : recompute le vecteur de déplacement
   * depuis les touches maintenues et renvoie l'échantillon sémantique du
   * tick courant (edges et delta d'effort sont consommés).
   */
  public sample(): InputFrame {
    const keys = this.mapping.movement;
    if (keys) {
      let x = 0;
      let y = 0;
      if (this.pressedCodes.has(keys.up)) y -= 1;
      if (this.pressedCodes.has(keys.down)) y += 1;
      if (this.pressedCodes.has(keys.left)) x -= 1;
      if (this.pressedCodes.has(keys.right)) x += 1;
      this.state.apply({ kind: 'axis', axis: 'movement', x: clamp(x), y: clamp(y) });
    }
    return this.state.sample();
  }

  /** Le dernier coup pressé depuis le dernier sample, prêt pour la simulation. */
  public consumeShotIntent(): ShotIntent | null {
    return this.state.takeShotIntent();
  }

  /** Échantillon `PlayerInput` complet (mouvement, effort, focus) pour la simulation. */
  public samplePlayerInput(): SimPlayerInput {
    const frame = this.sample();
    return toPlayerInput(frame);
  }

  public reset(): void {
    this.pressedCodes.clear();
    this.state.reset();
  }

  private handleKey(code: string, pressed: boolean): void {
    const justPressed = pressed && !this.pressedCodes.has(code);
    const justReleased = !pressed && this.pressedCodes.has(code);
    if (!justPressed && !justReleased) return;
    if (justPressed) this.pressedCodes.add(code);
    if (justReleased) this.pressedCodes.delete(code);

    if (this.mapping.shots[code]) {
      this.emit({ kind: pressed ? 'press-shot' : 'release-shot', shot: this.mapping.shots[code] });
      return;
    }
    if (this.mapping.focus === code) {
      this.emit({ kind: 'focus', pressed });
    }
  }

  private emit(action: GameAction): void {
    this.onAction?.(action);
    this.state.apply(action);
  }
}

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
