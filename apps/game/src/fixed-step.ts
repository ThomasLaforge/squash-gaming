export class FixedStepAccumulator {
  private readonly stepMs: number;
  private readonly maxElapsedMs: number;
  private accumulatorMs = 0;

  constructor(hz: number, maxElapsedMs = 250) {
    if (!Number.isFinite(hz) || hz <= 0) {
      throw new Error('La fréquence de simulation doit être strictement positive');
    }
    if (!Number.isFinite(maxElapsedMs) || maxElapsedMs <= 0) {
      throw new Error('Le retard maximal doit être strictement positif');
    }
    this.stepMs = 1000 / hz;
    this.maxElapsedMs = maxElapsedMs;
  }

  public advance(elapsedMs: number, onStep: () => void): number {
    const boundedElapsed = Math.min(Math.max(elapsedMs, 0), this.maxElapsedMs);
    this.accumulatorMs += boundedElapsed;

    const tolerance = this.stepMs * 1e-9;
    const steps = Math.floor((this.accumulatorMs + tolerance) / this.stepMs);
    this.accumulatorMs -= steps * this.stepMs;

    for (let index = 0; index < steps; index += 1) {
      onStep();
    }
    return steps;
  }

  public reset(): void {
    this.accumulatorMs = 0;
  }
}
