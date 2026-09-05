export interface Point3D {
  x: number
  y: number
  z: number
}

/** Evenly distributes `count` points on a sphere of `radius` using the golden-angle method. */
export function fibonacciSphere(count: number, radius: number): Point3D[] {
  const points: Point3D[] = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = goldenAngle * i

    points.push({
      x: Math.cos(theta) * radiusAtY * radius,
      y: y * radius,
      z: Math.sin(theta) * radiusAtY * radius,
    })
  }

  return points
}

/**
 * Spherical-linear-interpolates between two points that lie on the same
 * sphere (same distance from the origin), returning a point that also lies
 * on that sphere at fraction `t` along the great-circle arc between them.
 * Used to draw connections that hug the globe's surface instead of cutting
 * through it as a flat chord.
 */
export function slerpOnSphere(a: Point3D, b: Point3D, t: number, radius: number): Point3D {
  const dot = (a.x * b.x + a.y * b.y + a.z * b.z) / (radius * radius)
  const omega = Math.acos(Math.min(1, Math.max(-1, dot)))

  if (omega < 1e-4) return a // points coincide (or are antipodal-adjacent). Nothing meaningful to interpolate

  const sinOmega = Math.sin(omega)
  const wa = Math.sin((1 - t) * omega) / sinOmega
  const wb = Math.sin(t * omega) / sinOmega

  return {
    x: a.x * wa + b.x * wb,
    y: a.y * wa + b.y * wb,
    z: a.z * wa + b.z * wb,
  }
}

/** Rotates a point around the Y axis (yaw) then the X axis (pitch). Angles in radians. */
export function rotatePoint(p: Point3D, yaw: number, pitch: number): Point3D {
  const cosY = Math.cos(yaw)
  const sinY = Math.sin(yaw)
  const x1 = p.x * cosY + p.z * sinY
  const z1 = p.z * cosY - p.x * sinY

  const cosX = Math.cos(pitch)
  const sinX = Math.sin(pitch)
  const y2 = p.y * cosX - z1 * sinX
  const z2 = p.y * sinX + z1 * cosX

  return { x: x1, y: y2, z: z2 }
}
