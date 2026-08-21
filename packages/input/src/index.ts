export { InputState, toPlayerInput, type InputStateOptions } from './state';
export {
  KeyboardAdapter,
  type KeyboardAdapterOptions
} from './keyboard';
export {
  GamepadAdapter,
  type GamepadAdapterOptions,
  type GamepadLike
} from './gamepad';
export {
  DEFAULT_KEYBOARD_MAPPING,
  DEFAULT_GAMEPAD_MAPPING,
  applyDeadZone,
  type KeyboardMapping,
  type GamepadMapping
} from './mapping';
export type {
  GameAction,
  InputFrame,
  ShotAction
} from './types';
export { EMPTY_INPUT_FRAME } from './types';
