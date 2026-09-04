/**
 * Simplified world coastlines, as [lon, lat] rings.
 *
 * Hand-reduced outlines rather than a real coastline dataset: the globe draws
 * these as ~1.5px dots, where nothing finer than a peninsula survives, and a
 * proper dataset is tens of kilobytes plus a fetch. These are accurate enough
 * that continents are recognisable at a glance and city markers land on the
 * right piece of ground, which is the whole job.
 */
const POLYGONS: number[][][] = [
  // --- North America ---
  [
    [-168, 66], [-165, 60], [-158, 57], [-152, 58], [-145, 60], [-137, 58], [-130, 53],
    [-125, 48], [-124, 42], [-121, 36], [-117, 32], [-114, 28], [-110, 24], [-106, 21],
    [-97, 16], [-92, 15], [-88, 16], [-87, 21], [-91, 19], [-95, 19], [-97, 23], [-97, 26],
    [-94, 29], [-89, 29], [-84, 30], [-82, 26], [-80, 25], [-81, 31], [-76, 35], [-74, 39],
    [-70, 42], [-67, 45], [-64, 46], [-60, 47], [-56, 51], [-56, 54], [-64, 60], [-78, 62],
    [-76, 68], [-85, 70], [-95, 69], [-105, 69], [-115, 70], [-125, 70], [-133, 69],
    [-141, 70], [-152, 71], [-160, 70], [-166, 68],
  ],
  // Greenland
  [
    [-45, 60], [-52, 64], [-53, 68], [-56, 72], [-60, 76], [-64, 80], [-58, 83], [-45, 83],
    [-32, 82], [-22, 78], [-20, 74], [-25, 70], [-32, 68], [-38, 65], [-43, 61],
  ],
  // --- South America ---
  [
    [-81, -4], [-80, -7], [-76, -14], [-71, -18], [-70, -23], [-71, -30], [-73, -40],
    [-75, -48], [-74, -53], [-68, -55], [-65, -54], [-63, -42], [-62, -39], [-57, -38],
    [-56, -35], [-53, -33], [-48, -28], [-48, -25], [-44, -23], [-40, -21], [-39, -16],
    [-37, -11], [-35, -6], [-38, -3], [-44, -2], [-48, -1], [-50, 0], [-52, 4], [-60, 8],
    [-62, 10], [-72, 12], [-77, 8], [-78, 2], [-80, -2],
  ],
  // --- Africa ---
  [
    [-17, 15], [-17, 21], [-13, 28], [-10, 31], [-6, 36], [0, 36], [10, 37], [11, 34],
    [20, 33], [25, 32], [32, 31], [35, 28], [37, 22], [39, 15], [43, 12], [51, 12],
    [51, 5], [42, -1], [40, -10], [40, -18], [35, -24], [32, -29], [26, -34], [19, -35],
    [15, -27], [12, -18], [9, -1], [3, 6], [-5, 5], [-8, 4], [-13, 9],
  ],
  // Madagascar
  [[43, -12], [50, -15], [50, -25], [45, -25], [43, -16]],
  // --- Eurasia ---
  [
    [-9, 43], [-9, 38], [-6, 36], [0, 39], [3, 42], [8, 44], [12, 45], [16, 42], [19, 40],
    [24, 40], [26, 38], [29, 36], [35, 36], [36, 33], [34, 28], [39, 21], [43, 13],
    [48, 14], [52, 17], [57, 22], [60, 25], [66, 25], [70, 21], [73, 16], [77, 8],
    [80, 10], [82, 17], [87, 21], [89, 22], [92, 21], [95, 16], [98, 10], [101, 4],
    [104, 10], [108, 11], [109, 18], [106, 21], [110, 21], [113, 22], [117, 24], [121, 30],
    [122, 37], [126, 40], [129, 43], [131, 46], [135, 48], [141, 52], [143, 54], [140, 58],
    [145, 60], [155, 60], [162, 60], [170, 62], [180, 66], [180, 70], [170, 70], [160, 71],
    [150, 73], [140, 74], [130, 73], [120, 74], [110, 77], [100, 77], [90, 76], [80, 74],
    [70, 73], [60, 71], [55, 68], [45, 68], [40, 66], [33, 70], [28, 70], [20, 70],
    [15, 68], [12, 65], [10, 60], [12, 57], [10, 55], [8, 54], [4, 52], [-2, 51], [-5, 48],
    [-2, 47], [-2, 44],
  ],
  // British Isles
  [[-10, 52], [-6, 55], [-6, 58], [-3, 58], [-1, 55], [1, 52], [-5, 50]],
  // Iceland
  [[-24, 65], [-14, 66], [-14, 64], [-22, 63]],
  // Japan
  [
    [130, 31], [132, 34], [136, 35], [140, 36], [141, 39], [141, 45], [145, 44], [142, 42],
    [140, 38], [137, 37], [135, 34], [131, 33],
  ],
  // Sumatra
  [[95, 5], [98, 2], [103, -2], [106, -6], [104, -6], [100, -1]],
  // Java
  [[105, -6], [114, -8], [112, -8], [106, -7]],
  // Borneo
  [[109, 2], [117, 4], [119, 0], [116, -4], [110, -3]],
  // Sulawesi + New Guinea
  [[119, 1], [125, 1], [125, -5], [120, -5], [119, -2]],
  [[131, -1], [141, -3], [147, -8], [141, -9], [134, -5]],
  // Philippines
  [[120, 18], [124, 18], [126, 10], [122, 6], [120, 12]],
  // Sri Lanka
  [[80, 9], [82, 7], [81, 6], [80, 8]],
  // --- Oceania ---
  [
    [113, -22], [114, -26], [115, -32], [118, -35], [124, -33], [130, -32], [135, -35],
    [138, -35], [141, -38], [146, -39], [150, -37], [153, -33], [153, -28], [152, -25],
    [149, -21], [146, -19], [143, -14], [142, -11], [137, -12], [136, -15], [131, -12],
    [129, -15], [125, -14], [122, -17], [117, -20],
  ],
  // Tasmania
  [[145, -41], [148, -41], [148, -43], [145, -43]],
  // New Zealand
  [[173, -35], [175, -37], [178, -38], [176, -41], [174, -41], [173, -43], [170, -45], [167, -46], [171, -42]],
]

/** Bounding boxes, so most points reject after four comparisons. */
const BOXES = POLYGONS.map((poly) => {
  let minLon = Infinity
  let maxLon = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  for (const [lon, lat] of poly) {
    if (lon < minLon) minLon = lon
    if (lon > maxLon) maxLon = lon
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }
  return { minLon, maxLon, minLat, maxLat }
})

/** Ray casting: count edge crossings on a ray heading east from the point. */
function inRing(lon: number, lat: number, ring: number[][]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

export function isLand(lat: number, lon: number) {
  if (lat < -63) return true // Antarctica, near enough at this scale
  for (let i = 0; i < POLYGONS.length; i++) {
    const b = BOXES[i]
    if (lon < b.minLon || lon > b.maxLon || lat < b.minLat || lat > b.maxLat) continue
    if (inRing(lon, lat, POLYGONS[i])) return true
  }
  return false
}

/**
 * Every sampled point that falls on land, resolved once.
 *
 * The camera moves but the coastlines don't, so testing polygons inside the
 * draw loop would repeat the same few million point-in-polygon tests on every
 * animation frame. Resolving the set up front leaves the per-frame work as
 * pure projection.
 */
export function buildLandPoints(latStep: number, lonArc: number) {
  const points: [number, number][] = []
  const DEG = Math.PI / 180
  for (let lat = -87; lat <= 87; lat += latStep) {
    // widen the longitude step toward the poles, or the dots bunch into a
    // tight knot at the top and bottom of the sphere
    const step = lonArc / Math.max(Math.cos(lat * DEG), 0.16)
    for (let lon = -180; lon < 180; lon += step) {
      if (isLand(lat, lon)) points.push([lat, lon])
    }
  }
  return points
}
