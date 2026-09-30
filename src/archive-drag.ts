export type DragAxis = "lane" | "row";
export type DragPosition = Record<DragAxis, number>;
export type DragProjection = Record<DragAxis, { x: number; y: number }>;

/** Invert the camera's two projected tracks so the plane follows any pointer path. */
export class ArchiveDrag {
  active = false;
  moved = false;
  value: DragPosition = { lane: 0, row: 0 };
  private x = 0;
  private y = 0;
  private inverse: DragProjection | null = null;
  private intent: DragAxis | "free" = "free";
  private projection: DragProjection | null = null;
  private samples: { value: DragPosition; time: number }[] = [];
  private lastMotion = -Infinity;
  private motionDirection = { x: 0, y: 0 };
  private pointer = { x: 0, y: 0 };
  private axisLock = false;

  start(x: number, y: number, projection: DragProjection, time = 0, axisLock = false) {
    this.active = false;
    this.moved = false;
    this.intent = "free";
    this.projection = { lane: { ...projection.lane }, row: { ...projection.row } };
    this.axisLock = axisLock;
    this.x = x;
    this.y = y;
    this.value = { lane: 0, row: 0 };
    this.samples = [{ value: this.value, time }];
    this.lastMotion = -Infinity;
    this.motionDirection = { x: 0, y: 0 };
    this.pointer = { x, y };
    const { lane, row } = projection;
    const determinant = lane.x * row.y - row.x * lane.y;
    const area = Math.hypot(lane.x, lane.y) * Math.hypot(row.x, row.y);
    this.inverse =
      Number.isFinite(area) && area > 0 && Math.abs(determinant) > area * 0.001
        ? {
            lane: { x: row.y / determinant, y: -row.x / determinant },
            row: { x: -lane.y / determinant, y: lane.x / determinant },
          }
        : null;
  }

  move(x: number, y: number, time: number) {
    const dx = x - this.x,
      dy = y - this.y;
    const distance = Math.hypot(dx, dy);
    if (distance >= 10) this.moved = true;
    if (!this.inverse || (!this.active && distance < 10)) return;
    if (!this.active) {
      if (this.axisLock) this.intent = Math.abs(dx) >= Math.abs(dy) ? "lane" : "row";
      else if (Math.abs(dx) > Math.abs(dy) * 1.7) this.intent = "lane";
      else if (Math.abs(dy) > Math.abs(dx) * 1.7) this.intent = "row";
    }
    this.active = true;
    const value = {
      lane: dx * this.inverse.lane.x + dy * this.inverse.lane.y,
      row: dx * this.inverse.row.x + dy * this.inverse.row.y,
    };
    if (this.intent === "lane" && this.projection && Math.abs(this.projection.lane.x) > 1) {
      value.lane = dx / this.projection.lane.x; value.row = 0;
    } else if (this.intent === "row" && this.projection && Math.abs(this.projection.row.y) > 1) {
      value.row = dy / this.projection.row.y; value.lane = 0;
    }
    const previous = this.samples.at(-1);
    if (previous) {
      const delta = { x: x - this.pointer.x, y: y - this.pointer.y };
      if (Math.hypot(delta.x, delta.y) > 1e-9) {
        this.lastMotion = time;
        // A reversal starts a fresh estimate, without locking either axis.
        if (
          delta.x * this.motionDirection.x + delta.y * this.motionDirection.y <
          0
        )
          this.samples = [previous];
        this.motionDirection = delta;
      }
    }
    this.pointer = { x, y };
    this.value = value;
    if (previous?.time === time)
      this.samples[this.samples.length - 1] = { value, time };
    else this.samples.push({ value, time });
    this.samples = this.samples
      .filter((sample) => time - sample.time <= 120)
      .slice(-32);
  }

  /** Actual release velocity in both tracks, in cells/second. */
  releaseVelocity(time: number, reduced: boolean): DragPosition {
    const first = this.samples[0],
      last = this.samples.at(-1);
    if (
      reduced ||
      !first ||
      !last ||
      time - this.lastMotion > 80 ||
      last.time - first.time < 8
    )
      return { lane: 0, row: 0 };
    const scale = 1000 / (last.time - first.time);
    return {
      lane: (last.value.lane - first.value.lane) * scale,
      row: (last.value.row - first.value.row) * scale,
    };
  }
}

/** Free scrolling first, then a short spring to the nearest resting cell. */
export class ArchiveMomentum {
  value: number;
  velocity: number;
  phase: "coasting" | "snapping" | "idle";
  target: number;
  private readonly friction = 3.8;
  private bounded(value: number) { return this.bounds ? Math.max(this.bounds[0], Math.min(this.bounds[1], value)) : value; }

  private bounds?: [number, number];
  constructor(value: number, velocity: number, bounds?: [number, number], precision = false) {
    this.bounds = bounds;
    this.value = value;
    this.velocity = velocity;
    this.phase = Math.abs(velocity) >= 0.75 ? "coasting" : "snapping";
    this.target = this.bounded(Math.round(value));
    if (precision) {
      this.phase = "snapping";
      // A quick flick can finish the next step, without crossing several files.
      this.target = this.bounded(Math.round(value + Math.max(-0.45, Math.min(0.45, velocity * 0.12))));
    }
    if (value !== this.bounded(value)) this.phase = "snapping";
  }

  step(dt: number, coasting = this.phase === "coasting") {
    if (coasting && this.phase === "coasting") {
      const decay = Math.exp(-this.friction * dt);
      this.value += (this.velocity * (1 - decay)) / this.friction;
      this.velocity *= decay;
      if (Math.abs(this.velocity) < 0.6 || this.value !== this.bounded(this.value)) {
        this.target = this.bounded(Math.round(this.value + this.velocity / this.friction));
        this.phase = "snapping";
      }
    } else if (this.phase === "snapping") {
      const rate = 12;
      const delta = this.value - this.target;
      const impulse = this.velocity + rate * delta;
      const decay = Math.exp(-rate * dt);
      this.value = this.target + (delta + impulse * dt) * decay;
      this.velocity = (this.velocity - rate * impulse * dt) * decay;
      if (
        Math.abs(this.value - this.target) < 0.0001 &&
        Math.abs(this.velocity) < 0.005
      ) {
        this.value = this.target;
        this.velocity = 0;
        this.phase = "idle";
      }
    }
  }
}

/** Independent settling lets the finite lateral rail yield at either end. */
export class ArchivePlaneMomentum {
  readonly lane: ArchiveMomentum;
  readonly row: ArchiveMomentum;
  constructor(value: DragPosition, velocity: DragPosition, laneBounds?: [number, number], precision = false) {
    this.lane = new ArchiveMomentum(value.lane, Math.max(-2.6, Math.min(2.6, velocity.lane)), laneBounds, precision);
    const rowLimit = precision ? 6 : 16;
    this.row = new ArchiveMomentum(value.row, Math.max(-rowLimit, Math.min(rowLimit, velocity.row)), undefined, precision);
  }
  get phase() {
    return this.lane.phase === "coasting" || this.row.phase === "coasting"
      ? "coasting"
      : this.lane.phase === "idle" && this.row.phase === "idle"
        ? "idle"
        : "snapping";
  }
  get value(): DragPosition {
    return { lane: this.lane.value, row: this.row.value };
  }
  get velocity(): DragPosition {
    return { lane: this.lane.velocity, row: this.row.velocity };
  }
  step(dt: number) {
    const coasting = this.phase === "coasting";
    this.lane.step(dt, coasting);
    this.row.step(dt, coasting);
  }
}
