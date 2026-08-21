import type * as Rapier from '@dimforge/rapier3d-compat';

import {
  BALL_MASS,
  BALL_RADIUS,
  BACK_OUT_HEIGHT,
  FIXED_DT,
  FRONT_OUT_HEIGHT,
  GRAVITY,
  RESTITUTION,
  SIMULATION_HZ,
  SOL_FRICTION,
  TIN_HEIGHT,
  sideOutHeight
} from './constants';
import { COURT_SURFACES, type CourtSurface } from './court';
import { getRapier } from './rapier';
import type {
  ContactInfo,
  GameEvent,
  PlayerInput,
  RenderSnapshot,
  SimulationInit,
  SimulationState,
  Vec3
} from './types';

const ZERO: Vec3 = { x: 0, y: 0, z: 0 };

function copyVector(vector: Rapier.Vector): Vec3 {
  return { x: vector.x, y: vector.y, z: vector.z };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function speed(vector: Vec3): number {
  return Math.sqrt(dot(vector, vector));
}

/** Moteur headless M1 : balle Rapier, court solide et événements typés. */
export class Simulation {
  private readonly rapier: typeof Rapier;
  private readonly world: Rapier.World;
  private readonly eventQueue: Rapier.EventQueue;
  private readonly ballBody: Rapier.RigidBody;
  private readonly ballCollider: Rapier.Collider;
  private readonly surfaces = new Map<number, CourtSurface>();
  private readonly listeners = new Set<(event: GameEvent) => void>();
  private readonly dt: number;
  private readonly initialPosition: Vec3;
  private readonly initialVelocity: Vec3;
  private tickCount = 0;
  private floorContactCount = 0;
  private disposed = false;

  private constructor(rapier: typeof Rapier, init: SimulationInit) {
    this.rapier = rapier;
    this.dt = init.dt ?? FIXED_DT;
    this.initialPosition = init.position ?? { x: 3, y: 0, z: 1 };
    this.initialVelocity = init.velocity ?? ZERO;
    const gravity = init.gravity ?? GRAVITY;

    this.world = new rapier.World(new rapier.Vector3(0, 0, gravity));
    this.world.timestep = this.dt;
    this.world.maxCcdSubsteps = 4;

    for (const courtSurface of COURT_SURFACES) {
      const body = this.world.createRigidBody(
        rapier.RigidBodyDesc.fixed().setTranslation(
          courtSurface.center.x,
          courtSurface.center.y,
          courtSurface.center.z
        )
      );
      const collider = this.world.createCollider(
        rapier.ColliderDesc
          .cuboid(
            courtSurface.halfExtents.x,
            courtSurface.halfExtents.y,
            courtSurface.halfExtents.z
          )
          .setRestitution(RESTITUTION[courtSurface.surface])
          .setFriction(courtSurface.surface === 'sol' ? SOL_FRICTION : 0)
          .setActiveCollisionTypes(rapier.ActiveCollisionTypes.DYNAMIC_FIXED),
        body
      );
      this.surfaces.set(collider.handle, courtSurface);
    }

    this.ballBody = this.world.createRigidBody(
      rapier.RigidBodyDesc
        .dynamic()
        .setTranslation(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z)
        .setLinvel(this.initialVelocity.x, this.initialVelocity.y, this.initialVelocity.z)
        .setLinearDamping(0.01)
        .setCcdEnabled(true)
    );
    this.ballCollider = this.world.createCollider(
      rapier.ColliderDesc
        .ball(BALL_RADIUS)
        .setDensity(BALL_MASS)
        .setRestitution(RESTITUTION.sol)
        .setFriction(SOL_FRICTION)
        .setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS)
        .setActiveCollisionTypes(rapier.ActiveCollisionTypes.DYNAMIC_FIXED),
      this.ballBody
    );
    this.eventQueue = new rapier.EventQueue(true);
  }

  /** Rapier WASM doit être initialisé avant de construire le monde. */
  static async create(init: SimulationInit = {}): Promise<Simulation> {
    return new Simulation(await getRapier(), init);
  }

  get timestep(): number {
    return this.dt;
  }

  get frequency(): number {
    return Math.round(1 / this.dt) || SIMULATION_HZ;
  }

  onEvent(listener: (event: GameEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): SimulationState {
    return {
      tick: this.tickCount,
      time: this.tickCount * this.dt,
      position: copyVector(this.ballBody.translation()),
      velocity: copyVector(this.ballBody.linvel()),
      floorContacts: this.floorContactCount
    };
  }

  getRenderSnapshot(): RenderSnapshot {
    const state = this.getState();
    return { ...state, speed: speed(state.velocity) };
  }

  /** Avance exactement un pas fixe. Les entrées sont réservées aux milestones suivants. */
  step(_input?: PlayerInput): void {
    this.assertUsable();
    const beforeVelocity = copyVector(this.ballBody.linvel());
    this.world.step(this.eventQueue);
    const position = copyVector(this.ballBody.translation());

    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      if (!started) return;
      const otherHandle =
        handle1 === this.ballCollider.handle
          ? handle2
          : handle2 === this.ballCollider.handle
            ? handle1
            : null;
      if (otherHandle === null) return;
      const surface = this.surfaces.get(otherHandle);
      if (!surface) return;
      this.emitContact(surface, position, beforeVelocity);
    });

    this.tickCount += 1;
    this.emit({ type: 'TICK', tick: this.tickCount, time: this.tickCount * this.dt });
  }

  /** Alias de compatibilité pour le bootstrap M0. */
  tick(input?: PlayerInput): void {
    this.step(input);
  }

  reset(position = this.initialPosition, velocity = this.initialVelocity): void {
    this.assertUsable();
    this.ballBody.setTranslation(new this.rapier.Vector3(position.x, position.y, position.z), true);
    this.ballBody.setLinvel(new this.rapier.Vector3(velocity.x, velocity.y, velocity.z), true);
    this.tickCount = 0;
    this.floorContactCount = 0;
    this.eventQueue.clear();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.eventQueue.free();
    this.world.free();
  }

  private emitContact(surface: CourtSurface, position: Vec3, beforeVelocity: Vec3): void {
    const contact: ContactInfo = {
      surface: surface.surface,
      point: { ...position },
      normal: { ...surface.normal },
      impactSpeed: Math.abs(dot(beforeVelocity, surface.normal))
    };

    if (surface.surface === 'sol') {
      this.floorContactCount += 1;
      if (this.floorContactCount === 2) {
        this.emit({ type: 'SECOND_REBOND', ...contactWithoutSurface(contact) });
      } else {
        this.emit({ type: 'IMPACT', ...contact });
      }
      return;
    }

    if (surface.surface === 'frontal' && position.z <= TIN_HEIGHT) {
      this.emit({ type: 'TIN', ...contactWithoutSurface(contact) });
      return;
    }
    if (
      (surface.surface === 'frontal' && position.z >= FRONT_OUT_HEIGHT) ||
      (surface.surface === 'arriere' && position.z >= BACK_OUT_HEIGHT) ||
      (surface.surface === 'latere' && position.z >= sideOutHeight(position.x))
    ) {
      this.emit({ type: 'OUT', ...contactWithoutSurface(contact) });
      return;
    }
    this.emit({ type: 'IMPACT', ...contact });
  }

  private emit(event: GameEvent): void {
    for (const listener of this.listeners) listener(event);
  }

  private assertUsable(): void {
    if (this.disposed) throw new Error('La simulation a été libérée');
  }
}

function contactWithoutSurface(contact: ContactInfo): Omit<ContactInfo, 'surface'> {
  return {
    point: contact.point,
    normal: contact.normal,
    impactSpeed: contact.impactSpeed
  };
}
