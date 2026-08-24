import { T_POSITION } from '@squash-gaming/simulation';
import type { SimulationInit, Vec3 } from '@squash-gaming/simulation';

export interface LabScenario {
  id: string;
  name: string;
  description: string;
  position: Vec3;
  velocity: Vec3;
}

export const LAB_SCENARIOS: readonly LabScenario[] = [
  {
    id: 'drop',
    name: 'Chute libre',
    description: 'La balle tombe verticalement puis rebondit sur le sol.',
    position: { x: 3, y: 0, z: 1 },
    velocity: { x: 0, y: 0, z: 0 }
  },
  {
    id: 'front-wall',
    name: 'Mur frontal',
    description: 'La balle vise le mur frontal au-dessus du tin.',
    position: { x: 5, y: 0, z: 1.7 },
    velocity: { x: -8, y: 0, z: 2 }
  },
  {
    id: 'tin',
    name: 'Tin',
    description: 'La trajectoire arrive sous la ligne du tin.',
    position: { x: 4, y: 0, z: 0.7 },
    velocity: { x: -10, y: 0, z: 1 }
  },
  {
    id: 'side-wall',
    name: 'Mur latéral',
    description: 'La balle part vers le mur latéral gauche.',
    position: { x: 3, y: -2.2, z: 1.6 },
    velocity: { x: 2, y: -5, z: 0 }
  },
  {
    id: 'diagonal',
    name: 'Trajectoire diagonale',
    description: 'Une trajectoire montante traverse le court en diagonale.',
    position: { x: 2, y: -2, z: 1.8 },
    velocity: { x: 6, y: 5, z: 2 }
  },
  {
    id: 'back-wall',
    name: 'Mur arrière',
    description: 'La balle monte vers le mur arrière avant de retomber.',
    position: { x: 4, y: 0, z: 3.1 },
    velocity: { x: 8, y: 0, z: 0 }
  },
  {
    id: 'front-corner',
    name: 'Coin avant',
    description: 'La balle traverse le court vers le coin frontal gauche.',
    position: { x: 4.2, y: 2.1, z: 1.6 },
    velocity: { x: -7, y: -5, z: 2 }
  },
  {
    id: 'back-corner',
    name: 'Coin arrière',
    description: 'La balle s’éloigne vers le coin arrière droit.',
    position: { x: 4.8, y: -2.1, z: 1.8 },
    velocity: { x: 7, y: 5, z: 2 }
  },
  {
    id: 'behind-player',
    name: 'Balle derrière le joueur',
    description: 'La balle part dans le dos du joueur placé au T.',
    position: { x: 7.2, y: 0.9, z: 1.5 },
    velocity: { x: 4, y: -1, z: 0.5 }
  },
  {
    id: 'shot-ready',
    name: 'Balle prête à frapper',
    description: 'La balle est à portée du joueur pour tester les quatre coups.',
    position: { x: T_POSITION - 0.7, y: 0, z: 1.1 },
    velocity: { x: 0, y: 0, z: 0 }
  }
];

export function toSimulationInit(scenario: LabScenario): SimulationInit {
  return { position: scenario.position, velocity: scenario.velocity };
}
