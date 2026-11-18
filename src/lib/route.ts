/** Small deterministic Catmull-Rom route sampler for the railway map. */

export type Pt = { x: number; y: number };

type Cubic = { p0: Pt; p1: Pt; p2: Pt; p3: Pt };

export type Sample = { point: Pt; fraction: number };

export type Route = {
  d: string;
  length: number;
  samples: Sample[];
  at: (progress: number) => Pt;
  fractionOf: (point: Pt) => number;
};

const cubicPoint = (c: Cubic, t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return {
    x: a * c.p0.x + b * c.p1.x + d * c.p2.x + e * c.p3.x,
    y: a * c.p0.y + b * c.p1.y + d * c.p2.y + e * c.p3.y,
  };
};

export const buildRoute = (points: Pt[]): Route => {
  const curves: Cubic[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    curves.push({
      p0,
      p1: {
        x: p1.x + (p2.x - p0.x) / 6,
        y: p1.y + (p2.y - p0.y) / 6,
      },
      p2: {
        x: p2.x - (p3.x - p1.x) / 6,
        y: p2.y - (p3.y - p1.y) / 6,
      },
      p3: p2,
    });
  }

  const STEPS_PER_CURVE = 48;
  const samples: Sample[] = [];
  let length = 0;
  let previous: Pt | null = null;

  curves.forEach((curve, curveIndex) => {
    for (let s = 0; s <= STEPS_PER_CURVE; s++) {
      if (curveIndex > 0 && s === 0) continue;
      const point = cubicPoint(curve, s / STEPS_PER_CURVE);
      if (previous) {
        length += Math.hypot(point.x - previous.x, point.y - previous.y);
      }
      samples.push({ point, fraction: 0 });
      previous = point;
    }
  });

  samples.forEach((sample, index) => {
    let walked = 0;
    for (let i = 1; i <= index; i++) {
      walked += Math.hypot(
        samples[i].point.x - samples[i - 1].point.x,
        samples[i].point.y - samples[i - 1].point.y,
      );
    }
    sample.fraction = length === 0 ? 0 : walked / length;
  });

  const path = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const curve = curves[index - 1];
    return `${acc} C ${curve.p1.x} ${curve.p1.y} ${curve.p2.x} ${curve.p2.y} ${curve.p3.x} ${curve.p3.y}`;
  }, "");

  const at = (progress: number): Pt => {
    const clamped = Math.max(0, Math.min(1, progress));
    const target = clamped * length;
    for (let i = 1; i < samples.length; i++) {
      const previousSample = samples[i - 1];
      const current = samples[i];
      const segLength = Math.hypot(
        current.point.x - previousSample.point.x,
        current.point.y - previousSample.point.y,
      );
      const segStart = previousSample.fraction * length;
      if (segStart + segLength >= target) {
        const local = segLength === 0 ? 0 : (target - segStart) / segLength;
        return {
          x:
            previousSample.point.x +
            (current.point.x - previousSample.point.x) * local,
          y:
            previousSample.point.y +
            (current.point.y - previousSample.point.y) * local,
        };
      }
    }
    return samples[samples.length - 1].point;
  };

  const fractionOf = (point: Pt): number => {
    let best = samples[0];
    let bestDistance = Infinity;
    samples.forEach((sample) => {
      const distance = Math.hypot(
        sample.point.x - point.x,
        sample.point.y - point.y,
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        best = sample;
      }
    });
    return best.fraction;
  };

  return { d: path, length, samples, at, fractionOf };
};
