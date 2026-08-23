import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import {
  BACK_OUT_HEIGHT,
  CEILING_MIN_HEIGHT,
  COURT_HALF_WIDTH,
  COURT_LENGTH,
  FRONT_OUT_HEIGHT,
  SERVICE_BOX_SIZE,
  SERVICE_LINE_HEIGHT,
  SHORT_LINE_FROM_BACK,
  TIN_HEIGHT
} from '@squash-gaming/simulation';
import type { Vec3 } from '@squash-gaming/simulation';

export interface ImpactMarker {
  id: number;
  type: string;
  point: Vec3;
}

export interface ImpactFlash {
  speed: number;
  time: number;
}

export type CourtTheme = 'glass' | 'indoor';

interface SimulationSceneProps {
  position: Vec3;
  trail: Vec3[];
  impacts: ImpactMarker[];
  squash?: number;
  theme?: CourtTheme;
  cameraHeight?: number;
  cameraDistance?: number;
}

function toView(point: Vec3): [number, number, number] {
  return [point.x, point.z, point.y];
}

const REAR_VIEW = {
  position: [COURT_LENGTH + 6.1, 5.0, 0] as [number, number, number],
  lookAt: [COURT_LENGTH / 2, 1.0, 0] as [number, number, number]
};

const TRAIL_CAPACITY = 180;

export const DEFAULT_CAMERA_HEIGHT = 5.0;
export const DEFAULT_CAMERA_DISTANCE = 6.1;
export const MIN_CAMERA_DISTANCE = 4.5;
export const MAX_CAMERA_DISTANCE = 14;

const THEME_PALETTES = {
  glass: {
    background: '#0a1525',
    floor: '#31516b',
    floorLine: '#f2f7ff',
    wall: '#0c2947',
    wallOpacity: 0.78,
    frontWall: '#0c2947',
    rearWall: '#0c2947',
    sideWall: '#0c2947',
    wallLine: '#f2f7ff',
    tin: '#f2f7ff'
  },
  indoor: {
    background: '#101923',
    floor: '#996b4c',
    floorLine: '#b9333d',
    wall: '#f3f3ee',
    wallOpacity: 0.94,
    frontWall: '#f3f3ee',
    rearWall: '#bcdce5',
    sideWall: '#f3f3ee',
    wallLine: '#b9333d',
    tin: '#b9333d'
  }
} as const;

function CameraSetup({ cameraHeight, cameraDistance }: { cameraHeight: number; cameraDistance: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(COURT_LENGTH + cameraDistance, cameraHeight, 0);
    camera.lookAt(...REAR_VIEW.lookAt);
  }, [camera, cameraHeight, cameraDistance]);

  return null;
}

function Court({ theme }: { theme: CourtTheme }) {
  const palette = THEME_PALETTES[theme];

  return (
    <group>
      <mesh position={[COURT_LENGTH / 2, -0.04, 0]} receiveShadow>
        <boxGeometry args={[COURT_LENGTH, 0.08, COURT_HALF_WIDTH * 2]} />
        <meshStandardMaterial color={palette.floor} roughness={0.85} />
      </mesh>
      <mesh position={[0, CEILING_MIN_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.08, CEILING_MIN_HEIGHT, COURT_HALF_WIDTH * 2]} />
        <meshStandardMaterial color={palette.frontWall} transparent opacity={palette.wallOpacity} />
      </mesh>
      <mesh position={[COURT_LENGTH, CEILING_MIN_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.08, CEILING_MIN_HEIGHT, COURT_HALF_WIDTH * 2]} />
        <meshStandardMaterial color={palette.rearWall} transparent opacity={theme === 'indoor' ? 0.24 : palette.wallOpacity * 0.8} />
      </mesh>
      <mesh position={[COURT_LENGTH / 2, CEILING_MIN_HEIGHT / 2, -COURT_HALF_WIDTH]}>
        <boxGeometry args={[COURT_LENGTH, CEILING_MIN_HEIGHT, 0.08]} />
        <meshStandardMaterial color={palette.sideWall} transparent opacity={palette.wallOpacity * 0.7} />
      </mesh>
      <mesh position={[COURT_LENGTH / 2, CEILING_MIN_HEIGHT / 2, COURT_HALF_WIDTH]}>
        <boxGeometry args={[COURT_LENGTH, CEILING_MIN_HEIGHT, 0.08]} />
        <meshStandardMaterial color={palette.sideWall} transparent opacity={palette.wallOpacity * 0.7} />
      </mesh>
      <mesh position={[0.02, TIN_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.12, TIN_HEIGHT, COURT_HALF_WIDTH * 2]} />
        <meshStandardMaterial color={palette.tin} roughness={0.8} />
      </mesh>
      <FloorMarkings theme={theme} />
      <WallMarkings theme={theme} />
    </group>
  );
}

function FloorMarkings({ theme }: { theme: CourtTheme }) {
  const palette = THEME_PALETTES[theme];
  const shortLineX = COURT_LENGTH - SHORT_LINE_FROM_BACK;
  const halfCourtLineLength = COURT_LENGTH - shortLineX;
  const lineHeight = 0.018;
  const lineWidth = 0.025;

  return (
    <group>
      {theme === 'indoor' &&
        Array.from({ length: 18 }, (_, index) => (
          <mesh key={`plank-${index}`} position={[COURT_LENGTH / 2, 0.012, -COURT_HALF_WIDTH + (index + 0.5) * (COURT_HALF_WIDTH * 2 / 18)]}>
            <boxGeometry args={[COURT_LENGTH, 0.012, 0.012]} />
            <meshBasicMaterial color="#714a38" transparent opacity={0.5} />
          </mesh>
        ))}
      <mesh position={[shortLineX, lineHeight, 0]}>
        <boxGeometry args={[lineWidth, lineHeight, COURT_HALF_WIDTH * 2]} />
        <meshBasicMaterial color={palette.floorLine} />
      </mesh>
      <mesh position={[shortLineX + halfCourtLineLength / 2, lineHeight, 0]}>
        <boxGeometry args={[halfCourtLineLength, lineHeight, lineWidth]} />
        <meshBasicMaterial color={palette.floorLine} />
      </mesh>
      <ServiceBox side="left" x={shortLineX} color={palette.floorLine} lineHeight={lineHeight} lineWidth={lineWidth} />
      <ServiceBox side="right" x={shortLineX} color={palette.floorLine} lineHeight={lineHeight} lineWidth={lineWidth} />
      <mesh position={[COURT_LENGTH / 2, lineHeight, -COURT_HALF_WIDTH + lineWidth / 2]}>
        <boxGeometry args={[COURT_LENGTH, lineHeight, lineWidth]} />
        <meshBasicMaterial color={palette.floorLine} />
      </mesh>
      <mesh position={[COURT_LENGTH / 2, lineHeight, COURT_HALF_WIDTH - lineWidth / 2]}>
        <boxGeometry args={[COURT_LENGTH, lineHeight, lineWidth]} />
        <meshBasicMaterial color={palette.floorLine} />
      </mesh>
      <mesh position={[lineWidth / 2, lineHeight, 0]}>
        <boxGeometry args={[lineWidth, lineHeight, COURT_HALF_WIDTH * 2]} />
        <meshBasicMaterial color={palette.floorLine} />
      </mesh>
      <mesh position={[COURT_LENGTH - lineWidth / 2, lineHeight, 0]}>
        <boxGeometry args={[lineWidth, lineHeight, COURT_HALF_WIDTH * 2]} />
        <meshBasicMaterial color={palette.floorLine} />
      </mesh>
    </group>
  );
}

function ServiceBox({
  side,
  x,
  color,
  lineHeight,
  lineWidth
}: {
  side: 'left' | 'right';
  x: number;
  color: string;
  lineHeight: number;
  lineWidth: number;
}) {
  const direction = side === 'left' ? -1 : 1;
  const centerZ = direction * (COURT_HALF_WIDTH - SERVICE_BOX_SIZE / 2);
  const innerZ = direction * (COURT_HALF_WIDTH - SERVICE_BOX_SIZE);
  const rearX = x + SERVICE_BOX_SIZE;

  return (
    <group>
      <mesh position={[rearX, lineHeight, centerZ]}>
        <boxGeometry args={[lineWidth, lineHeight, SERVICE_BOX_SIZE]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[x + SERVICE_BOX_SIZE / 2, lineHeight, innerZ]}>
        <boxGeometry args={[SERVICE_BOX_SIZE, lineHeight, lineWidth]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function WallMarkings({ theme }: { theme: CourtTheme }) {
  const palette = THEME_PALETTES[theme];
  const thickness = 0.025;
  const sideLineAngle = Math.atan2(BACK_OUT_HEIGHT - FRONT_OUT_HEIGHT, COURT_LENGTH);
  const sideLineHeight = (FRONT_OUT_HEIGHT + BACK_OUT_HEIGHT) / 2;

  return (
    <group>
      <mesh position={[0.045, FRONT_OUT_HEIGHT, 0]}>
        <boxGeometry args={[thickness, thickness, COURT_HALF_WIDTH * 2]} />
        <meshBasicMaterial color={palette.wallLine} />
      </mesh>
      <mesh position={[0.045, SERVICE_LINE_HEIGHT, 0]}>
        <boxGeometry args={[thickness, thickness, COURT_HALF_WIDTH * 2]} />
        <meshBasicMaterial color={palette.wallLine} />
      </mesh>
      <mesh position={[COURT_LENGTH - 0.045, BACK_OUT_HEIGHT, 0]}>
        <boxGeometry args={[thickness, thickness, COURT_HALF_WIDTH * 2]} />
        <meshBasicMaterial color={palette.wallLine} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <mesh
          key={`side-out-${side}`}
          position={[COURT_LENGTH / 2, sideLineHeight, side * (COURT_HALF_WIDTH + 0.045)]}
          rotation={[0, 0, sideLineAngle]}
        >
          <boxGeometry args={[COURT_LENGTH, thickness, thickness]} />
          <meshBasicMaterial color={palette.wallLine} />
        </mesh>
      ))}
    </group>
  );
}

function Ball({ position, squash = 0 }: { position: Vec3; squash?: number }) {
  const scale = 1 + squash;
  const tangential = 1 + (1 - squash) * 0.5;
  return (
    <mesh position={toView(position)} scale={[tangential, scale, tangential]}>
      <sphereGeometry args={[0.09, 24, 16]} />
      <meshStandardMaterial color="#f08a24" emissive="#5d2600" emissiveIntensity={0.35} />
    </mesh>
  );
}

function Trajectory({ points }: { points: Vec3[] }) {
  const line = useMemo(
    () => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_CAPACITY * 3), 3));
      geometry.setDrawRange(0, 0);
      const trajectory = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: '#f08a24', transparent: true, opacity: 0.8 })
      );
      trajectory.frustumCulled = false;
      return trajectory;
    },
    []
  );

  useEffect(() => {
    const position = line.geometry.getAttribute('position') as THREE.BufferAttribute;
    const visiblePoints = Math.min(points.length, TRAIL_CAPACITY);
    for (let index = 0; index < visiblePoints; index += 1) {
      const point = points[index];
      position.setXYZ(index, point.x, point.z, point.y);
    }
    position.needsUpdate = true;
    line.geometry.setDrawRange(0, visiblePoints);
  }, [line, points]);

  useEffect(() => () => {
    line.geometry.dispose();
    line.material.dispose();
  }, [line]);

  return <primitive object={line} />;
}

function ImpactMarkers({ impacts }: { impacts: ImpactMarker[] }) {
  return (
    <group>
      {impacts.map((impact) => (
        <mesh key={impact.id} position={toView(impact.point)}>
          <sphereGeometry args={[0.075, 12, 8]} />
          <meshBasicMaterial color={impact.type === 'TIN' || impact.type === 'OUT' ? '#d64045' : '#2d78c7'} />
        </mesh>
      ))}
    </group>
  );
}

function SceneContents({ position, trail, impacts, squash, theme, cameraHeight, cameraDistance }: Required<SimulationSceneProps & { cameraHeight: number; cameraDistance: number }>) {
  return (
    <>
      <CameraSetup cameraHeight={cameraHeight} cameraDistance={cameraDistance} />
      <color attach="background" args={[THEME_PALETTES[theme].background]} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[4, 9, 5]} intensity={2.2} castShadow />
      <Court theme={theme} />
      <Trajectory points={trail} />
      <ImpactMarkers impacts={impacts} />
      <Ball position={position} squash={squash} />
    </>
  );
}

export function SimulationScene({ theme = 'glass', squash = 0, cameraHeight = DEFAULT_CAMERA_HEIGHT, cameraDistance = DEFAULT_CAMERA_DISTANCE, ...props }: SimulationSceneProps) {
  return (
    <div style={{ height: 560, borderRadius: 16, overflow: 'hidden', background: THEME_PALETTES[theme].background }} data-testid="physics-scene">
      <Canvas shadows={false} camera={{ fov: 45, near: 0.1, far: 100 }}>
        <SceneContents theme={theme} squash={squash} cameraHeight={cameraHeight} cameraDistance={cameraDistance} {...props} />
      </Canvas>
    </div>
  );
}
