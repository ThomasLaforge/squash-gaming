import type { PlayerInput as SimPlayerInput, ShotIntent } from '@squash-gaming/simulation';
import { DEFAULT_GAMEPAD_MAPPING, applyDeadZone, type DeviceMapping } from './mapping';
import { InputState, type InputStateOptions, toPlayerInput } from './state';
import type { GameAction, InputFrame } from './types';

/** Vue minimale d'une manette conforme au Gamepad API (testable sans navigateur). */
export interface GamepadLike {
  index: number;
  connected: boolean;
  axes: number[];
  buttons: { pressed: boolean; value: number }[];
}

export interface GamepadAdapterOptions extends InputStateOptions {
  mapping?: DeviceMapping;
  /** Source des manettes ; défaut : `navigator.getGamepads` si disponible. */
  getGamepads?: () => (GamepadLike | null)[];
  deadZone?: number;
  /** Reçoit les événements sémantiques émis (telemétrie, tests, UI). */
  onAction?: (action: GameAction) => void;
}

/**
 * Adaptateur manette : pollé au rythme de la simulation, convertit axes et
 * boutons en échantillons sémantiques. Les codes Standard Gamepad Mapping
 * restent ici, jamais dans le gameplay (ADR 0004).
 */
export class GamepadAdapter {
  public readonly state: InputState;

  private readonly mapping: DeviceMapping;
  private readonly getGamepads: () => (GamepadLike | null)[];
  private readonly onAction?: (action: GameAction) => void;
  private readonly deadZone: number;

  private prevSticks = { movement: { x: 0, y: 0 }, aim: { x: 0, y: 0 } };
  private prevButtons: boolean[] = [];

  constructor(options: GamepadAdapterOptions) {
    this.mapping = options.mapping ?? DEFAULT_GAMEPAD_MAPPING;
    this.getGamepads = options.getGamepads ?? defaultGetGamepads;
    this.onAction = options.onAction;
    this.deadZone = options.deadZone ?? 0.15;
    this.state = new InputState(options);
  }

  /**
   * Poll de la manette, à appeler au rythme de la simulation.
   * Renvoie l'échantillon sémantique du tick courant.
   * Aucune manette connectée ⇒ trame vide et relâchements.
   */
  public poll(): InputFrame {
    const pad = this.getGamepads().find((gamepad): gamepad is GamepadLike => !!gamepad && gamepad.connected);
    if (!pad) {
      this.flushReleases();
      this.prevSticks = { movement: { x: 0, y: 0 }, aim: { x: 0, y: 0 } };
      this.applyAxes();
      return this.state.sample();
    }
    const movement = applyDeadZone(pad.axes[0] ?? 0, pad.axes[1] ?? 0, this.deadZone);
    const aim = applyDeadZone(pad.axes[2] ?? 0, pad.axes[3] ?? 0, this.deadZone);
    this.prevSticks = { movement, aim };
    this.updateButtons(pad);
    this.applyAxes();
    return this.state.sample();
  }

  private applyAxes(): void {
    this.state.apply({ kind: 'axis', axis: 'movement', ...this.prevSticks.movement });
    this.state.apply({ kind: 'axis', axis: 'aim', ...this.prevSticks.aim });
  }

  /** Le dernier coup pressé depuis le dernier poll, prêt pour la simulation. */
  public consumeShotIntent(): ShotIntent | null {
    return this.state.takeShotIntent();
  }

  /** Effort courant [0, 1]. */
  public getEffort(): number {
    return this.state.getEffort();
  }

  /** Échantillon `PlayerInput` complet (mouvement, visée, effort, focus). */
  public samplePlayerInput(): SimPlayerInput {
    const frame = this.poll();
    return toPlayerInput(frame, this.state.getEffort());
  }

  public reset(): void {
    this.prevButtons = [];
    this.prevSticks = { movement: { x: 0, y: 0 }, aim: { x: 0, y: 0 } };
    this.state.reset();
  }

  private updateButtons(pad: GamepadLike): void {
    const count = Math.max(this.prevButtons.length, pad.buttons.length, 17);
    for (let i = 0; i < count; i += 1) {
      const key = `standard:${i}`;
      const pressed = !!pad.buttons[i]?.pressed;
      const wasPressed = this.prevButtons[i] ?? false;
      this.prevButtons[i] = pressed;

      const effort = this.mapping.effort[key];
      if (effort) {
        // Valeur continue : émise à chaque poll selon l'état de la gâchette.
        const action: GameAction = { kind: 'effort', value: effort * (pressed ? 1 : 0) };
        this.emit(action);
        continue;
      }
      if (pressed === wasPressed) continue;
      if (this.mapping.shots[key]) {
        this.emit(pressed
          ? { kind: 'press-shot', shot: this.mapping.shots[key] }
          : { kind: 'release-shot' });
        continue;
      }
      if (this.mapping.focus === key) {
        this.emit({ kind: 'focus', pressed });
      }
    }
  }

  private flushReleases(): void {
    this.prevButtons.forEach((pressed, i) => {
      if (!pressed) return;
      const key = `standard:${i}`;
      if (key in this.mapping.effort) {
        this.emit({ kind: 'effort', value: 0 });
        return;
      }
      if (this.mapping.shots[key]) this.emit({ kind: 'release-shot' });
      if (this.mapping.focus === key) this.emit({ kind: 'focus', pressed: false });
    });
    this.prevButtons = [];
  }

  private emit(action: GameAction): void {
    this.onAction?.(action);
    this.state.apply(action);
  }
}

function defaultGetGamepads(): (GamepadLike | null)[] {
  const nav = globalThis as { navigator?: { getGamepads?: () => (GamepadLike | null)[] } };
  return nav.navigator?.getGamepads ? nav.navigator.getGamepads() : [];
}
