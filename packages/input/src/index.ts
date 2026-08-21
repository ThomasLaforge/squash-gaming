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
  directionVector,
  type DeviceMapping
} from './mapping';
export type {
  GameAction,
  InputFrame,
  ShotAction,
  StickDirection
} from './types';
export { EMPTY_INPUT_FRAME } from './types';
