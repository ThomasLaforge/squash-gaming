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
  addEventListener(type: 'keydown' | 'keyup', listener: (event: KeyboardEventLike) => void): void;
  removeEventListener(type: 'keydown' | 'keyup', listener: (event: KeyboardEventLike) => void): void;
}

interface KeyboardEventLike {
  key: string;
  preventDefault?: () => void;
}

/**
 * Adaptateur clavier : convertit les presses/releases de touches en
 * échantillons sémantiques. Les touches logiques restent ici, jamais dans le
 * gameplay (ADR 0004). `KeyboardEvent.key` est volontaire : contrairement à
 * `code`, il respecte la disposition AZERTY/QWERTY du clavier utilisé.
 */
export class KeyboardAdapter {
  public readonly state: InputState;

  private mapping: KeyboardMapping;
  private readonly onAction?: (action: GameAction) => void;
  private readonly pressedKeys = new Set<string>();
  private readonly handleKeyDown: (event: KeyboardEventLike) => void;
  private readonly handleKeyUp: (event: KeyboardEventLike) => void;

  constructor(options: KeyboardAdapterOptions) {
    this.mapping = options.mapping ?? DEFAULT_KEYBOARD_MAPPING;
    this.onAction = options.onAction;
    this.state = new InputState(options);
    this.handleKeyDown = (event) => {
      const key = normalizeKey(event.key);
      if (this.isMappedKey(key)) event.preventDefault?.();
      this.handleKey(key, true);
    };
    this.handleKeyUp = (event) => this.handleKey(normalizeKey(event.key), false);
  }

  public attach(target: KeyTargetLike): void {
    target.addEventListener('keydown', this.handleKeyDown);
    target.addEventListener('keyup', this.handleKeyUp);
  }

  public detach(target: KeyTargetLike): void {
    target.removeEventListener('keydown', this.handleKeyDown);
    target.removeEventListener('keyup', this.handleKeyUp);
    this.pressedKeys.clear();
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
      if (this.pressedKeys.has(keys.up)) y -= 1;
      if (this.pressedKeys.has(keys.down)) y += 1;
      if (this.pressedKeys.has(keys.left)) x -= 1;
      if (this.pressedKeys.has(keys.right)) x += 1;
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
    return { ...toPlayerInput(frame), shot: this.state.takeShotIntent() };
  }

  public reset(): void {
    this.pressedKeys.clear();
    this.state.reset();
  }

  public setMapping(mapping: KeyboardMapping): void {
    this.mapping = mapping;
    this.reset();
  }

  private handleKey(key: string, pressed: boolean): void {
    const justPressed = pressed && !this.pressedKeys.has(key);
    const justReleased = !pressed && this.pressedKeys.has(key);
    if (!justPressed && !justReleased) return;
    if (justPressed) this.pressedKeys.add(key);
    if (justReleased) this.pressedKeys.delete(key);

    if (this.mapping.shots[key]) {
      this.emit({ kind: pressed ? 'press-shot' : 'release-shot', shot: this.mapping.shots[key] });
      return;
    }
    if (this.mapping.focus === key) {
      this.emit({ kind: 'focus', pressed });
    }
  }

  private emit(action: GameAction): void {
    this.onAction?.(action);
    this.state.apply(action);
  }

  private isMappedKey(key: string): boolean {
    const movement = this.mapping.movement;
    return movement
      ? Object.values(movement).includes(key) || key in this.mapping.shots || this.mapping.focus === key
      : key in this.mapping.shots || this.mapping.focus === key;
  }
}

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLocaleLowerCase() : key;
}
