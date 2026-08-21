import {
  CEILING_MIN_HEIGHT,
  COURT_HALF_WIDTH,
  COURT_LENGTH
} from './constants';
import type { ContactSurface, Vec3 } from './types';

export interface CourtSurface {
  surface: ContactSurface;
  center: Vec3;
  halfExtents: Vec3;
  normal: Vec3;
}

const WALL_THICKNESS = 0.05;
const HALF_WALL_HEIGHT = CEILING_MIN_HEIGHT / 2;

function surface(
  surfaceType: ContactSurface,
  center: Vec3,
  halfExtents: Vec3,
  normal: Vec3
): CourtSurface {
  return { surface: surfaceType, center, halfExtents, normal };
}

/** Solides Rapier du court, avec leurs faces internes sur les dimensions officielles. */
export const COURT_SURFACES: readonly CourtSurface[] = [
  surface(
    'frontal',
    { x: -WALL_THICKNESS / 2, y: 0, z: HALF_WALL_HEIGHT },
    { x: WALL_THICKNESS / 2, y: COURT_HALF_WIDTH, z: HALF_WALL_HEIGHT },
    { x: -1, y: 0, z: 0 }
  ),
  surface(
    'arriere',
    { x: COURT_LENGTH + WALL_THICKNESS / 2, y: 0, z: HALF_WALL_HEIGHT },
    { x: WALL_THICKNESS / 2, y: COURT_HALF_WIDTH, z: HALF_WALL_HEIGHT },
    { x: 1, y: 0, z: 0 }
  ),
  surface(
    'latere',
    { x: COURT_LENGTH / 2, y: -COURT_HALF_WIDTH - WALL_THICKNESS / 2, z: HALF_WALL_HEIGHT },
    { x: COURT_LENGTH / 2, y: WALL_THICKNESS / 2, z: HALF_WALL_HEIGHT },
    { x: 0, y: -1, z: 0 }
  ),
  surface(
    'latere',
    { x: COURT_LENGTH / 2, y: COURT_HALF_WIDTH + WALL_THICKNESS / 2, z: HALF_WALL_HEIGHT },
    { x: COURT_LENGTH / 2, y: WALL_THICKNESS / 2, z: HALF_WALL_HEIGHT },
    { x: 0, y: 1, z: 0 }
  ),
  surface(
    'sol',
    { x: COURT_LENGTH / 2, y: 0, z: -WALL_THICKNESS / 2 },
    { x: COURT_LENGTH / 2, y: COURT_HALF_WIDTH, z: WALL_THICKNESS / 2 },
    { x: 0, y: 0, z: 1 }
  )
];
