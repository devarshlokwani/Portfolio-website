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
