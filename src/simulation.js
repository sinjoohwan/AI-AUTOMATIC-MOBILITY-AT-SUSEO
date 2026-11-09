export const BOUNDS = { minX: -14.0, maxX: 15.0, minZ: -9.4, maxZ: 8.4 };
export const FLOOR_BOUNDS = {
  '1F': BOUNDS,
  B1: { minX: -11.8, maxX: 14.0, minZ: -9.9, maxZ: 5.6 },
};
export const FLOOR_ORDER = ['1F', 'B1'];
const drivingRules = { deck: true, replan: true, rescue: true, keep: true };
export function setDrivingRule(id, enabled) {
  if (Object.prototype.hasOwnProperty.call(drivingRules, id)) drivingRules[id] = Boolean(enabled);
}
const MAP_CLEARANCE = 0.18;

export function boundsFor(floor = '1F') {
  return FLOOR_BOUNDS[floor] || BOUNDS;
}

export const nodes = [
  { id: 'hall', label: '대합실', x: -4.0, z: -2.6, floor: '1F', radius: 0.75 },
  { id: 'ev1', label: 'EV1', x: -7.4, z: 3.3, floor: '1F', radius: 0.62 },
  { id: 'lift_12', label: '1·2번 엘리베이터', x: 6.0, z: -6.4, floor: '1F', radius: 0.66 },
  { id: 'lift_34', label: '3·4번 엘리베이터', x: 6.0, z: -1.0, floor: '1F', radius: 0.66 },
  { id: 'lift_56', label: '5·6번 엘리베이터', x: 6.0, z: 4.0, floor: '1F', radius: 0.66 },
  { id: 'taxi', label: '택시 타는곳', x: 12.35, z: 1.05, floor: '1F', radius: 0.62 },
  { id: 'info', label: '안내창구B1', x: -3.2, z: -3.8, floor: '1F', radius: 0.62, service: true },
  { id: 'ground_exit', label: '지상층', x: -9.65, z: 1.9, floor: '1F', radius: 0.6, service: true },
  { id: 'subway', label: '지하철 타는곳', x: -12.35, z: 5.45, floor: '1F', radius: 0.62 },
  { id: 'charge', label: '충전 부스', x: -9.35, z: -3.55, floor: '1F', radius: 0.7 },
  { id: 'b1_lift_12', label: '1·2번 엘리베이터', x: 10.5, z: -6.4, floor: 'B1', radius: 0.66, service: true },
  { id: 'b1_lift_34', label: '3·4번 엘리베이터', x: 10.5, z: -1.0, floor: 'B1', radius: 0.66, service: true },
  { id: 'b1_lift_56', label: '5·6번 엘리베이터', x: 10.5, z: 4.0, floor: 'B1', radius: 0.66, service: true },
  { id: 'b2_info', label: '안내창구', x: -7.85, z: -3.8, floor: 'B1', radius: 0.66 },
  { id: 'b2_subway', label: '지하철 타는곳', x: -8.9, z: 3.55, floor: 'B1', radius: 0.62 },
  { id: 'p1a', label: '1A 승강장', x: 1.2, z: -7.45, floor: 'B1', radius: 0.55 },
  { id: 'p1b', label: '1B 승강장', x: 4.6, z: -7.45, floor: 'B1', radius: 0.55 },
  { id: 'p1c', label: '1C 승강장', x: 8.0, z: -7.45, floor: 'B1', radius: 0.55 },
  { id: 'p2a', label: '2A 승강장', x: 2.9, z: -5.95, floor: 'B1', radius: 0.55 },
  { id: 'p2b', label: '2B 승강장', x: 6.3, z: -5.95, floor: 'B1', radius: 0.55 },
  { id: 'p2c', label: '2C 승강장', x: 9.0, z: -5.95, floor: 'B1', radius: 0.55 },
  { id: 'p3a', label: '3A 승강장', x: 1.2, z: -2.7, floor: 'B1', radius: 0.55 },
  { id: 'p3b', label: '3B 승강장', x: 4.6, z: -2.7, floor: 'B1', radius: 0.55 },
  { id: 'p3c', label: '3C 승강장', x: 8.0, z: -2.7, floor: 'B1', radius: 0.55 },
  { id: 'p4a', label: '4A 승강장', x: 2.9, z: -0.55, floor: 'B1', radius: 0.55 },
  { id: 'p4b', label: '4B 승강장', x: 6.3, z: -0.55, floor: 'B1', radius: 0.55 },
  { id: 'p4c', label: '4C 승강장', x: 9.0, z: -0.55, floor: 'B1', radius: 0.55 },
  { id: 'p5a', label: '5A 승강장', x: 1.2, z: 2.5, floor: 'B1', radius: 0.55 },
  { id: 'p5b', label: '5B 승강장', x: 4.6, z: 2.5, floor: 'B1', radius: 0.55 },
  { id: 'p5c', label: '5C 승강장', x: 8.0, z: 2.5, floor: 'B1', radius: 0.55 },
  { id: 'p6a', label: '6A 승강장', x: 2.9, z: 4.15, floor: 'B1', radius: 0.55 },
  { id: 'p6b', label: '6B 승강장', x: 6.3, z: 4.15, floor: 'B1', radius: 0.55 },
  { id: 'p6c', label: '6C 승강장', x: 9.0, z: 4.15, floor: 'B1', radius: 0.55 },
];

const links = {
  hall: ['info', 'ground_exit', 'ev1', 'subway', 'lift_12', 'lift_34', 'lift_56', 'taxi', 'charge'],
  info: ['hall', 'lift_12'],
  ground_exit: ['hall', 'ev1', 'subway'],
  ev1: ['hall', 'ground_exit', 'subway'],
  subway: ['hall', 'ev1', 'ground_exit'],
  lift_12: ['hall', 'info', 'lift_34', 'b1_lift_12'],
  lift_34: ['hall', 'lift_12', 'lift_56', 'taxi', 'b1_lift_34'],
  lift_56: ['hall', 'lift_34', 'taxi', 'b1_lift_56'],
  taxi: ['hall', 'lift_34', 'lift_56'],
  charge: ['hall', 'ev1', 'lift_56'],
  b1_lift_12: ['lift_12', 'p1a', 'p1c', 'p2c'],
  b1_lift_34: ['lift_34', 'p3a', 'p3c', 'p4c'],
  b1_lift_56: ['lift_56', 'p5a', 'p5c', 'p6c'],
  b2_info: ['b2_subway', 'p1a', 'p2a'],
  b2_subway: ['b2_info', 'p6a'],
  p1a: ['b2_info', 'p1b', 'p2a', 'b1_lift_12'],
  p1b: ['p1a', 'p1c', 'p2b'],
  p1c: ['p1b', 'p2c', 'b1_lift_12'],
  p2a: ['b2_info', 'p2b', 'p1a'],
  p2b: ['p2a', 'p2c', 'p1b'],
  p2c: ['p2b', 'p1c', 'b1_lift_12'],
  p3a: ['b1_lift_34', 'p3b', 'p4a'],
  p3b: ['p3a', 'p3c', 'p4b'],
  p3c: ['p3b', 'p4c', 'b1_lift_34'],
  p4a: ['p3a', 'p4b'],
  p4b: ['p4a', 'p4c', 'p3b'],
  p4c: ['p4b', 'p3c', 'b1_lift_34'],
  p5a: ['b1_lift_56', 'p5b', 'p6a'],
  p5b: ['p5a', 'p5c', 'p6b'],
  p5c: ['p5b', 'p6c', 'b1_lift_56'],
  p6a: ['b2_subway', 'p6b', 'p5a'],
  p6b: ['p6a', 'p6c', 'p5b'],
  p6c: ['p6b', 'p5c', 'b1_lift_56'],
};

const SHAFTS = [
  { id: '12', gates: ['p1a', 'p1b', 'p1c', 'p2a', 'p2b', 'p2c', 'b2_info', 'b2_subway'], floors: { '1F': 'lift_12', B1: 'b1_lift_12' } },
  { id: '34', gates: ['p3a', 'p3b', 'p3c', 'p4a', 'p4b', 'p4c'], floors: { '1F': 'lift_34', B1: 'b1_lift_34' } },
  { id: '56', gates: ['p5a', 'p5b', 'p5c', 'p6a', 'p6b', 'p6c'], floors: { '1F': 'lift_56', B1: 'b1_lift_56' } },
];
const ELEVATOR_NODE_IDS = new Set(SHAFTS.flatMap((shaft) => Object.values(shaft.floors)));

export const floorFootprints = {
  '1F': [
    [-11.1, -6.25], [-1.6, -6.25],
    [-1.6, -8.0], [1.0, -8.0], [1.0, -6.25], [3.6, -6.25],
    [3.6, -8.7], [10.6, -8.7], [10.6, -4.2], [14.3, -4.2],
    [14.3, 2.2], [9.2, 2.2], [9.2, 2.8], [11.2, 2.8],
    [11.2, 6.2], [7.4, 6.2], [7.4, 7.7], [-3.4, 7.7],
    [-3.4, 6.6], [-11.1, 6.6],
    [-13.4, 6.6], [-13.4, 1.7], [-11.1, 1.7],
  ],
  B1: [
    [
      [-11.2, -8.15], [13.2, -8.15], [13.2, -5.35], [-2.15, -5.35],
      [-2.15, -3.55], [13.2, -3.55], [13.2, 0.15], [-2.15, 0.15],
      [-2.15, 1.7], [13.2, 1.7], [13.2, 5.05], [-11.2, 5.05],
    ],
  ],
};

export function footprintRings(floor) {
  const value = floorFootprints[floor] || [];
  if (!value.length || typeof value[0][0] === 'number') return value.length ? [value] : [];
  return value;
}

export const trackBeds = {
  B1: [
    [[-1.9, -9.35], [13.2, -9.35], [13.2, -8.2], [-1.9, -8.2]],
    [[-1.9, -5.35], [13.2, -5.35], [13.2, -3.55], [-1.9, -3.55]],
    [[-1.9, 0.15], [13.2, 0.15], [13.2, 1.7], [-1.9, 1.7]],
  ],
};

export const floorDetails = {};

export const elevatorCars = [
  { id: 'car-ev1', floors: ['1F'], x: -9.65, z: 3.25, w: 1.35, d: 1.15, label: 'EV1' },
  { id: 'car-12-1f', floors: ['1F'], x: 7.6, z: -6.4, w: 1.35, d: 1.35, label: '1·2' },
  { id: 'car-34-1f', floors: ['1F'], x: 7.6, z: -1.0, w: 1.35, d: 1.35, label: '3·4' },
  { id: 'car-56-1f', floors: ['1F'], x: 7.6, z: 4.0, w: 1.35, d: 1.35, label: '5·6' },
  { id: 'car-12', floors: ['B1'], x: 12.05, z: -6.4, w: 1.35, d: 1.35, label: '1·2' },
  { id: 'car-34', floors: ['B1'], x: 12.05, z: -1.0, w: 1.35, d: 1.35, label: '3·4' },
  { id: 'car-56', floors: ['B1'], x: 12.05, z: 4.0, w: 1.35, d: 1.35, label: '5·6' },
];

export const stationAreas = [
  { id: '1f-taxi-label', floor: '1F', x: 12.35, z: -0.15, w: 2.6, d: 0.4, label: '→ 택시 타는곳', kind: 'concourse', color: '#24465a' },
];

export const AMENITY_STYLE = {
  ticket: { label: '매표소', color: '#e7c56a' },
  restaurant: { label: '식당', color: '#e08a3c' },
  restroom: { label: '화장실', color: '#5eb0d4' },
  seat: { label: '안내 좌석', color: '#c5d4e4' },
  kiosk: { label: '키오스크', color: '#7d6ad8' },
  counter: { label: '안내창구', color: '#3d8b7a' },
  police: { label: '철도경찰', color: '#2c6b8a' },
  escalator: { label: '에스컬레이터', color: '#8aa4c8' },
  charger: { label: '충전기', color: '#1f8a72' },
  shop: { label: '상점', color: '#e7a15a' },
  cafe: { label: '커피집', color: '#c47a4a' },
  lounge: { label: '고객라운지', color: '#d7c4a2' },
  taxi: { label: '택시승강장', color: '#e7c56a' },
  search: { label: '정보검색', color: '#7d6ad8' },
};

export const amenities = [
  { id: '1f-charge', floor: '1F', x: -9.35, z: -3.7, w: 3.1, d: 4.6, kind: 'charger', label: '충전 부스' },
  { id: '1f-flower', floor: '1F', x: -9.65, z: -0.05, w: 1.9, d: 0.95, kind: 'shop', label: '꽃집' },
  { id: '1f-korean', floor: '1F', x: -9.65, z: 1.6, w: 1.9, d: 1.5, kind: 'restaurant', label: '한식당' },
  { id: '1f-police', floor: '1F', x: -6.6, z: -5.5, w: 2.15, d: 1.05, kind: 'police' },
  { id: '1f-info', floor: '1F', x: -3.55, z: -5.5, w: 2.15, d: 1.05, kind: 'counter', label: '안내창구B1' },
  { id: '1f-restroom', floor: '1F', x: -0.3, z: -6.5, w: 2.1, d: 1.5, kind: 'restroom' },
  { id: '1f-restaurant', floor: '1F', x: 9.7, z: -6.2, w: 1.45, d: 3.2, kind: 'restaurant' },
  { id: '1f-cafe', floor: '1F', x: -1.9, z: 6.35, w: 2.4, d: 1.35, kind: 'cafe' },
  { id: '1f-lounge', floor: '1F', x: 0.75, z: 6.35, w: 2.4, d: 1.35, kind: 'lounge' },
  { id: 'b1-store', floor: 'B1', x: -9.05, z: -6.78, w: 3.8, d: 2.25, kind: 'shop', label: '편의점' },
  { id: 'b1-info', floor: 'B1', x: -9.9, z: -3.78, w: 2.1, d: 2.15, kind: 'counter', label: '안내창구B2' },
  { id: 'b1-bench-a', floor: 'B1', x: -5.2, z: -1.55, w: 2.0, d: 0.55, kind: 'seat', label: '' },
  { id: 'b1-bench-b', floor: 'B1', x: -5.2, z: 0.7, w: 2.0, d: 0.55, kind: 'seat', label: '' },
];

export const buildings = [
  ...elevatorCars.map((car) => ({
    id: `${car.id}-shaft`,
    x: car.x,
    z: car.z,
    w: car.w,
    d: car.d,
    label: car.label,
    color: '#0054A6',
    floor: car.floors[0],
  })),
  ...amenities.filter((item) => item.kind !== 'charger').map((item) => ({
    ...item,
    label: AMENITY_STYLE[item.kind].label,
    color: AMENITY_STYLE[item.kind].color,
  })),
  ...stationAreas.filter((area) => area.kind === 'track').map((area) => ({
    id: area.id,
    x: area.x,
    z: area.z,
    w: area.w,
    d: area.d,
    label: area.label,
    color: area.color,
    floor: area.floor,
    kind: area.kind,
  })),
];

export const pillars = [
  { id: 'p1', x: -0.4, z: -1.4, r: 0.28, floor: '1F' },
  { id: 'p2', x: 2.4, z: 1.2, r: 0.28, floor: '1F' },
  { id: 'b1-col', x: -3.55, z: -0.4, r: 0.22, floor: 'B1' },
];

export const geofences = [];

const WANDER_BY_FLOOR = {
  '1F': [
    [-6.2, -2.2], [-2.2, -1.4], [1.2, -1.6], [3.4, 0.4],
    [-5.4, 1.6], [-1.2, 2.2], [2.6, 2.4], [4.2, -2.4],
  ],
  B1: [
    [-7.6, -0.4], [-7.5, 1.8], [-6.2, -5.2],
    [1.2, -6.7], [5.0, -6.7], [3.1, -1.6], [6.8, -1.6],
    [1.2, 3.3], [5.0, 3.3], [8.0, 3.3],
  ],
};

const PED_FLOOR_DISTRIBUTION = ['1F', '1F', '1F', 'B1', 'B1', 'B1'];

export function hypot(ax, az, bx, bz) {
  return Math.hypot(ax - bx, az - bz);
}

function stampEvent(type, text) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
    type,
    text,
  };
}

function withEvents(world, extra) {
  if (!extra?.length) return world;
  return { ...world, eventLog: [...extra, ...(world.eventLog || [])].slice(0, 24) };
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function nodeById(id) {
  return nodes.find((n) => n.id === id) || nodes[0];
}

export function nodeLabel(id) {
  return nodeById(id).label;
}

export function nearestNode(x, z, wheelchair = true, floor = '1F') {
  let best = nodes.find((n) => n.floor === floor && (!wheelchair || !n.forbidden)) || nodes[0];
  let bestD = Infinity;
  for (const n of nodes) {
    if (n.floor !== floor || (wheelchair && n.forbidden)) continue;
    const d = hypot(x, z, n.x, n.z);
    if (d < bestD) {
      best = n;
      bestD = d;
    }
  }
  return best;
}

export function resolveMapTarget(x, z, floor = '1F', extras = []) {
  const radius = 0.42;
  const bounds = boundsFor(floor);
  const isFree = (px, pz) => {
    if (
      px < bounds.minX + radius || px > bounds.maxX - radius
      || pz < bounds.minZ + radius || pz > bounds.maxZ - radius
    ) return false;
    for (const building of buildings) {
      if ((building.floor || '1F') === floor && rectangleClearance(px, pz, building, radius) < MAP_CLEARANCE) return false;
    }
    for (const pillar of pillars) {
      if ((pillar.floor || '1F') === floor && hypot(px, pz, pillar.x, pillar.z) < pillar.r + radius + MAP_CLEARANCE) return false;
    }
    for (const fence of geofences) {
      if ((fence.floor || '1F') === floor && hypot(px, pz, fence.x, fence.z) < fence.r + radius + MAP_CLEARANCE) return false;
    }
    for (const extra of extras) {
      if ((extra.floor || '1F') === floor && hypot(px, pz, extra.x, extra.z) < extra.r + radius + MAP_CLEARANCE) return false;
    }
    return true;
  };
  if (isFree(x, z)) return { x, z, floor };
  for (let distance = 0.2; distance <= 4; distance += 0.2) {
    for (let index = 0; index < 32; index += 1) {
      const angle = (index / 32) * Math.PI * 2;
      const px = x + Math.cos(angle) * distance;
      const pz = z + Math.sin(angle) * distance;
      if (isFree(px, pz)) return { x: px, z: pz, floor };
    }
  }
  return null;
}

const PATH_STEP = 0.45;
export const ROBOT_RADIUS = 0.42;

function pointInRing(ring, x, z) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i];
    const [xj, zj] = ring[j];
    const crosses = (zi > z) !== (zj > z)
      && x < ((xj - xi) * (z - zi)) / ((zj - zi) || 1e-9) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function onStationDeck(x, z, floor) {
  if (!drivingRules.deck) {
    const rings = footprintRings(floor);
    if (rings.length < 2) return true;
    return rings.some((ring) => pointInRing(ring, x, z));
  }
  return insideFootprint(x, z, floor, 0.32);
}

function mapPositionFree(x, z, floor, extras = []) {
  const bounds = boundsFor(floor);
  if (
    x < bounds.minX + ROBOT_RADIUS || x > bounds.maxX - ROBOT_RADIUS
    || z < bounds.minZ + ROBOT_RADIUS || z > bounds.maxZ - ROBOT_RADIUS
    || !onStationDeck(x, z, floor)
  ) return false;
  for (const building of buildings) {
    if ((building.floor || '1F') === floor && rectangleClearance(x, z, building, ROBOT_RADIUS) < MAP_CLEARANCE) return false;
  }
  for (const pillar of pillars) {
    if ((pillar.floor || '1F') === floor && hypot(x, z, pillar.x, pillar.z) < pillar.r + ROBOT_RADIUS + MAP_CLEARANCE) return false;
  }
  for (const fence of geofences) {
    if ((fence.floor || '1F') === floor && hypot(x, z, fence.x, fence.z) < fence.r + ROBOT_RADIUS + MAP_CLEARANCE) return false;
  }
  for (const extra of extras) {
    if ((extra.floor || '1F') === floor && hypot(x, z, extra.x, extra.z) < extra.r + ROBOT_RADIUS + MAP_CLEARANCE) return false;
  }
  return true;
}

function segmentIsFree(a, b, floor, extras = []) {
  const distance = hypot(a.x, a.z, b.x, b.z);
  const samples = Math.ceil(distance / 0.1);
  for (let index = 0; index <= samples; index += 1) {
    const t = samples ? index / samples : 0;
    if (!mapPositionFree(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, floor, extras)) return false;
  }
  return true;
}

function findSameFloorPath(start, goal, floor, extras = []) {
  const resolvedStart = mapPositionFree(start.x, start.z, floor, extras)
    ? start
    : resolveMapTarget(start.x, start.z, floor, extras);
  const resolvedGoal = mapPositionFree(goal.x, goal.z, floor, extras)
    ? goal
    : resolveMapTarget(goal.x, goal.z, floor, extras);
  if (
    !resolvedStart || !resolvedGoal
    || hypot(resolvedGoal.x, resolvedGoal.z, goal.x, goal.z) > (goal.snapRadius || goal.radius || 0.62)
  ) return null;

  const bounds = boundsFor(floor);
  const toCell = (point) => ({
    x: Math.round((point.x - bounds.minX) / PATH_STEP),
    z: Math.round((point.z - bounds.minZ) / PATH_STEP),
  });
  const toPoint = (cell) => ({
    x: bounds.minX + cell.x * PATH_STEP,
    z: bounds.minZ + cell.z * PATH_STEP,
  });
  const nearestFreeCell = (point) => {
    const origin = toCell(point);
    for (let radius = 0; radius <= 6; radius += 1) {
      for (let x = -radius; x <= radius; x += 1) {
        for (let z = -radius; z <= radius; z += 1) {
          if (radius && Math.abs(x) !== radius && Math.abs(z) !== radius) continue;
          const cell = { x: origin.x + x, z: origin.z + z };
          const candidate = toPoint(cell);
          if (mapPositionFree(candidate.x, candidate.z, floor, extras)
            && segmentIsFree(point, candidate, floor, extras)) return cell;
        }
      }
    }
    return null;
  };
  const startCell = nearestFreeCell(resolvedStart);
  const goalCell = nearestFreeCell(resolvedGoal);
  if (!startCell || !goalCell) return null;
  const keyOf = (cell) => `${cell.x},${cell.z}`;
  const pointFor = (cell) => toPoint(cell);
  const startKey = keyOf(startCell);
  const goalKey = keyOf(goalCell);
  const open = [{ ...startCell, key: startKey, f: hypot(startCell.x, startCell.z, goalCell.x, goalCell.z) }];
  const cameFrom = new Map();
  const cost = new Map([[startKey, 0]]);
  const closed = new Set();
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    if (closed.has(current.key)) continue;
    if (current.key === goalKey) break;
    closed.add(current.key);
    for (const [dx, dz] of directions) {
      const neighbor = { x: current.x + dx, z: current.z + dz };
      const point = pointFor(neighbor);
      if (!mapPositionFree(point.x, point.z, floor, extras)) continue;
      if (dx && dz) {
        const sideA = pointFor({ x: current.x + dx, z: current.z });
        const sideB = pointFor({ x: current.x, z: current.z + dz });
        if (!mapPositionFree(sideA.x, sideA.z, floor, extras)
          || !mapPositionFree(sideB.x, sideB.z, floor, extras)) continue;
      }
      const key = keyOf(neighbor);
      if (closed.has(key)) continue;
      const nextCost = cost.get(current.key) + (dx && dz ? Math.SQRT2 : 1);
      if (nextCost >= (cost.get(key) ?? Infinity)) continue;
      cameFrom.set(key, current.key);
      cost.set(key, nextCost);
      open.push({
        ...neighbor,
        key,
        f: nextCost + hypot(neighbor.x, neighbor.z, goalCell.x, goalCell.z),
      });
    }
  }

  if (startKey !== goalKey && !cameFrom.has(goalKey)) return null;
  const cells = [goalCell];
  let cursor = goalKey;
  while (cursor !== startKey) {
    cursor = cameFrom.get(cursor);
    if (!cursor) return null;
    const [x, z] = cursor.split(',').map(Number);
    cells.push({ x, z });
  }
  cells.reverse();
  const raw = [resolvedStart, ...cells.map(pointFor), resolvedGoal];
  const smoothed = [raw[0]];
  let index = 0;
  while (index < raw.length - 1) {
    let next = raw.length - 1;
    while (next > index + 1 && !segmentIsFree(raw[index], raw[next], floor, extras)) next -= 1;
    smoothed.push(raw[next]);
    index = next;
  }
  return smoothed.slice(1).map((point) => ({ x: point.x, z: point.z, floor }));
}

function shaftByNodeId(id) {
  if (!id) return null;
  return SHAFTS.find((shaft) => shaft.gates.includes(id) || Object.values(shaft.floors).includes(id)) || null;
}

function platformShaftById(id) {
  const match = /^p([1-6])[abc]$/.exec(id || '');
  if (!match) return null;
  const number = Number(match[1]);
  const shaftId = number <= 2 ? '12' : number <= 4 ? '34' : '56';
  return SHAFTS.find((shaft) => shaft.id === shaftId) || null;
}

function platformShaftByPosition(point) {
  if (!point || (point.floor || '1F') !== 'B1' || point.x < -2) return null;
  const shaftId = point.z <= -4.45 ? '12' : point.z <= 0.92 ? '34' : '56';
  return SHAFTS.find((shaft) => shaft.id === shaftId) || null;
}

function boundShaft(point) {
  if (!point) return null;
  return platformShaftById(point.id)
    || SHAFTS.find((shaft) => shaft.id === point.shaftId)
    || platformShaftByPosition(point)
    || null;
}

function shaftAhead(path, index = 0) {
  if (!path) return null;
  for (let cursor = index; cursor < path.length; cursor += 1) {
    const point = path[cursor];
    if (point && (point.elevator || (point.id && ELEVATOR_NODE_IDS.has(point.id)))) {
      return shaftByNodeId(point.id);
    }
  }
  return null;
}

function departurePoint(point, path, index, fallbackId) {
  const platformId = platformShaftById(point?.id)
    ? point.id
    : (platformShaftById(fallbackId) ? fallbackId : undefined);
  return {
    x: point.x,
    z: point.z,
    floor: point.floor || '1F',
    id: platformId,
    shaftId: shaftAhead(path, index)?.id,
  };
}

function doorOnRobotFloor(goal, floor) {
  if (!goal?.id || !goal.floor || goal.floor === floor) return null;
  const shaft = shaftByNodeId(goal.id);
  if (!shaft?.floors[floor]) return null;
  return nodeById(shaft.floors[floor]);
}

function nearestShaft(point) {
  const floor = point.floor || '1F';
  const choices = SHAFTS.filter((shaft) => shaft.floors[floor]);
  return choices.reduce((best, shaft) => {
    const node = nodeById(shaft.floors[floor]);
    const distance = hypot(point.x, point.z, node.x, node.z);
    if (!best || distance < best.distance) return { shaft, distance };
    return best;
  }, null).shaft;
}

function rideShaft(start, goal, shaft, extras) {
  const startFloor = start.floor || '1F';
  const goalFloor = goal.floor || startFloor;
  if (startFloor === goalFloor) return findSameFloorPath(start, goal, startFloor, extras);
  if (!shaft?.floors[startFloor] || !shaft.floors[goalFloor]) return null;
  const sourceLift = nodeById(shaft.floors[startFloor]);
  const destinationLift = nodeById(shaft.floors[goalFloor]);
  const toLift = findSameFloorPath(start, sourceLift, startFloor, extras);
  const tail = toLift && findSameFloorPath(destinationLift, goal, goalFloor, extras);
  if (!toLift || !tail) return null;
  return [
    ...toLift,
    { x: destinationLift.x, z: destinationLift.z, floor: goalFloor, elevator: true, id: destinationLift.id },
    ...tail,
  ];
}

function transferShafts(start, goal, fromShaft, toShaft, extras) {
  const via = FLOOR_ORDER.find((floor) => fromShaft.floors[floor] && toShaft.floors[floor]) || '1F';
  if (!fromShaft.floors[via] || !toShaft.floors[via]) return null;
  const upstairs = rideShaft(start, nodeById(fromShaft.floors[via]), fromShaft, extras);
  const across = findSameFloorPath(nodeById(fromShaft.floors[via]), nodeById(toShaft.floors[via]), via, extras);
  const downstairs = rideShaft(nodeById(toShaft.floors[via]), goal, toShaft, extras);
  if (!upstairs || !across || !downstairs) return null;
  return [...upstairs, ...across, ...downstairs];
}

export function findMapPath(start, goal, extras = []) {
  if (!start || !goal) return null;
  const startFloor = start.floor || '1F';
  const goalFloor = goal.floor || startFloor;
  if (startFloor === goalFloor) {
    const direct = findSameFloorPath(start, goal, startFloor, extras);
    if (direct) return direct;
    const fromDeck = shaftByNodeId(start.id) || nearestShaft(start);
    const toDeck = shaftByNodeId(goal.id) || nearestShaft(goal);
    if (!fromDeck || !toDeck || fromDeck.id === toDeck.id) return null;
    return transferShafts(start, goal, fromDeck, toDeck, extras);
  }
  const startShaft = boundShaft(start);
  const goalShaft = boundShaft(goal);
  if (startShaft && goalShaft && startShaft.id !== goalShaft.id) {
    return transferShafts(start, goal, startShaft, goalShaft, extras);
  }
  const locked = startShaft || goalShaft;
  if (locked) return rideShaft(start, goal, locked, extras);
  const ranked = SHAFTS
    .filter((shaft) => shaft.floors[startFloor] && shaft.floors[goalFloor])
    .sort((a, b) => {
      const doorA = nodeById(a.floors[startFloor]);
      const doorB = nodeById(b.floors[startFloor]);
      return hypot(start.x, start.z, doorA.x, doorA.z) - hypot(start.x, start.z, doorB.x, doorB.z);
    });
  for (const shaft of ranked) {
    const ridden = rideShaft(start, goal, shaft, extras);
    if (ridden) return ridden;
  }
  return null;
}

function crowdCost(ax, az, bx, bz, pedestrians) {
  if (!pedestrians?.length) return 0;
  const mx = (ax + bx) / 2;
  const mz = (az + bz) / 2;
  let nearby = 0;
  for (const p of pedestrians) {
    if (hypot(mx, mz, p.x, p.z) < 1.8) nearby += 1;
  }
  return nearby * 0.55;
}

export function findRoute(from, to, pedestrians = [], wheelchair = true) {
  const start = nodeById(from);
  const end = nodeById(to);
  if (start.id === end.id) return [start.id];

  const heuristic = (node) => hypot(node.x, node.z, end.x, end.z) + (node.floor === end.floor ? 0 : 6);
  const open = [{ id: start.id, path: [start.id], g: 0, f: heuristic(start) }];
  const bestG = new Map();

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift();
    if (cur.id === end.id) return cur.path;
    const recorded = bestG.get(cur.id);
    if (recorded !== undefined && cur.g > recorded) continue;
    bestG.set(cur.id, cur.g);
    for (const nid of links[cur.id] || []) {
      const n = nodeById(nid);
      if (wheelchair && n.forbidden) continue;
      const prev = nodeById(cur.id);
      const step = hypot(prev.x, prev.z, n.x, n.z)
        + (prev.floor === n.floor ? 0 : 6)
        + crowdCost(prev.x, prev.z, n.x, n.z, pedestrians.filter((p) => p.floor === n.floor));
      const g = cur.g + step;
      const known = bestG.get(nid);
      if (known !== undefined && g >= known) continue;
      open.push({
        id: nid,
        path: [...cur.path, nid],
        g,
        f: g + heuristic(n),
      });
    }
  }
  return [];
}

export function routeDistance(route) {
  let d = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const a = nodeById(route[i]);
    const b = nodeById(route[i + 1]);
    d += hypot(a.x, a.z, b.x, b.z) + (a.floor === b.floor ? 0 : 6);
  }
  return d;
}

export function etaSeconds(robot) {
  if (robot.missionPath?.length) {
    let remaining = 0;
    let previous = { x: robot.x, z: robot.z, floor: robot.floor };
    for (const point of robot.missionPath.slice(robot.missionPathIndex || 0)) {
      remaining += hypot(previous.x, previous.z, point.x, point.z);
      if (previous.floor !== point.floor) remaining += 6;
      previous = point;
    }
    return remaining / Math.max(0.28, robot.speed || 0.35);
  }
  const route = robot.route || [];
  if (!route.length || robot.status === '대기' || robot.status === '승객 대기' || robot.status === '하차 대기' || robot.status === '충전 중') return null;
  const next = nodeById(route[Math.min(robot.routeIndex + 1, route.length - 1)]);
  let remain = hypot(robot.x, robot.z, next.x, next.z) + (robot.floor === next.floor ? 0 : 6);
  if (robot.targetPoint) {
    const final = robot.targetPoint;
    remain += hypot(final.x, final.z, nodeById(route[route.length - 1]).x, nodeById(route[route.length - 1]).z);
  }
  for (let i = robot.routeIndex + 1; i < route.length - 1; i++) {
    const a = nodeById(route[i]);
    const b = nodeById(route[i + 1]);
    remain += hypot(a.x, a.z, b.x, b.z);
  }
  const v = Math.max(0.28, robot.speed || 0.35);
  return remain / v;
}

export function formatEta(seconds) {
  if (seconds == null) return '--:--';
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function nearestDeckCell(x, z, floor) {
  if (mapPositionFree(x, z, floor)) return { x, z };
  for (let distance = 0.18; distance <= 2.4; distance += 0.18) {
    for (let index = 0; index < 16; index += 1) {
      const angle = (index / 16) * Math.PI * 2;
      const px = x + Math.cos(angle) * distance;
      const pz = z + Math.sin(angle) * distance;
      if (mapPositionFree(px, pz, floor)) return { x: px, z: pz };
    }
  }
  return null;
}

function pushOut(x, z, radius, floor = '1F') {
  const bounds = boundsFor(floor);
  let px = x;
  let pz = z;
  px = clamp(px, bounds.minX + radius, bounds.maxX - radius);
  pz = clamp(pz, bounds.minZ + radius, bounds.maxZ - radius);

  for (const b of buildings) {
    if ((b.floor || '1F') !== floor) continue;
    const hx = b.w / 2 + radius;
    const hz = b.d / 2 + radius;
    const dx = px - b.x;
    const dz = pz - b.z;
    if (Math.abs(dx) < hx && Math.abs(dz) < hz) {
      const ox = hx - Math.abs(dx);
      const oz = hz - Math.abs(dz);
      if (ox < oz) px += Math.sign(dx || 1) * ox;
      else pz += Math.sign(dz || 1) * oz;
    }
  }

  for (const p of pillars) {
    if ((p.floor || '1F') !== floor) continue;
    const d = hypot(px, pz, p.x, p.z);
    const min = p.r + radius;
    if (d < min && d > 1e-4) {
      const k = min / d;
      px = p.x + (px - p.x) * k;
      pz = p.z + (pz - p.z) * k;
    }
  }

  for (const fence of geofences) {
    if ((fence.floor || '1F') !== floor) continue;
    const d = hypot(px, pz, fence.x, fence.z);
    const min = fence.r + radius;
    if (d < min && d > 1e-4) {
      const k = min / d;
      px = fence.x + (px - fence.x) * k;
      pz = fence.z + (pz - fence.z) * k;
    }
  }

  if (drivingRules.rescue && radius >= 0.3 && !mapPositionFree(px, pz, floor)) {
    const rescued = nearestDeckCell(px, pz, floor);
    if (rescued) return rescued;
  }
  return { x: px, z: pz };
}

function insideFootprint(x, z, floor, margin = 0.18) {
  const rings = footprintRings(floor);
  if (!rings.length) return true;
  const samples = [[0, 0], [margin, 0], [-margin, 0], [0, margin], [0, -margin]];
  return rings.some((ring) => samples.every(([dx, dz]) => pointInRing(ring, x + dx, z + dz)));
}

function pedestrianPositionFree(x, z, floor) {
  const bounds = boundsFor(floor);
  if (
    x < bounds.minX + 0.2 || x > bounds.maxX - 0.2
    || z < bounds.minZ + 0.2 || z > bounds.maxZ - 0.2
    || !insideFootprint(x, z, floor, 0.18)
  ) return false;
  if (buildings.some((building) => (building.floor || '1F') === floor
    && rectangleClearance(x, z, building, 0.2) < 0.1)) return false;
  if (pillars.some((pillar) => (pillar.floor || '1F') === floor
    && hypot(x, z, pillar.x, pillar.z) < pillar.r + 0.3)) return false;
  if (geofences.some((fence) => (fence.floor || '1F') === floor
    && hypot(x, z, fence.x, fence.z) < fence.r + 0.3)) return false;
  return true;
}

function ringIndex(floor, x, z) {
  const rings = footprintRings(floor);
  if (rings.length < 2) return 0;
  const inside = rings.findIndex((ring) => pointInRing(ring, x, z));
  if (inside >= 0) return inside;
  let best = 0;
  let bestDistance = Infinity;
  rings.forEach((ring, index) => {
    const xs = ring.map((point) => point[0]);
    const zs = ring.map((point) => point[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    const distance = hypot(x, z, cx, cz);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

function sameDeck(floor, ax, az, bx, bz) {
  const rings = footprintRings(floor);
  if (rings.length < 2) return true;
  return ringIndex(floor, ax, az) === ringIndex(floor, bx, bz);
}

function randomWander(floor = '1F', near) {
  const choices = WANDER_BY_FLOOR[floor] || WANDER_BY_FLOOR['1F'];
  const pool = near ? choices.filter(([x, z]) => sameDeck(floor, near.x, near.z, x, z)) : choices;
  const usable = pool.length ? pool : (near ? [] : choices);
  if (!usable.length) return { x: near.x, z: near.z };
  for (let i = 0; i < 12; i++) {
    const [x, z] = usable[Math.floor(Math.random() * usable.length)];
    const jx = x + (Math.random() - 0.5) * 1.4;
    const jz = z + (Math.random() - 0.5) * 1.1;
    if (pedestrianPositionFree(jx, jz, floor)) return { x: jx, z: jz };
  }
  const fallback = nodes.find((node) => node.floor === floor && !node.forbidden && pedestrianPositionFree(node.x, node.z, floor));
  if (fallback) return { x: fallback.x, z: fallback.z };
  return near ? { x: near.x, z: near.z } : { x: 0, z: 1.5 };
}

function spawnPedestrians(count) {
  return Array.from({ length: count }, (_, i) => {
    const floor = PED_FLOOR_DISTRIBUTION[i % PED_FLOOR_DISTRIBUTION.length];
    const spawn = randomWander(floor);
    const goal = randomWander(floor);
    return {
      id: `P-${String(i + 1).padStart(2, '0')}`,
      x: spawn.x,
      z: spawn.z,
      vx: 0,
      vz: 0,
      tx: goal.x,
      tz: goal.z,
      speed: 0.55 + Math.random() * 0.55,
      pause: Math.random() * 2,
      hue: i % 2,
      floor,
    };
  });
}

function makeRobot({ id, name, x, z, floor = '1F', battery, status, target, route, occupied, color, cruise }) {
  return {
    id,
    name,
    x,
    z,
    floor,
    heading: 0,
    battery,
    status,
    target,
    route,
    routeIndex: 0,
    occupied,
    passenger: null,
    color,
    cruise,
    speed: 0,
    nearestDist: 8,
    avoiding: false,
    stuck: 0,
    replanCool: 0,
    missCool: 0,
    pedestrianWait: 0,
    elevator: null,
    returnPrompt: false,
    returnHold: 0,
    homeSeq: 0,
    targetPoint: null,
    originPoint: null,
    missionPath: null,
    missionPathIndex: 0,
    missionStartIndex: 0,
    plannedMissionPath: null,
  };
}

export function createWorld() {
  const world = {
    robots: [
      makeRobot({
        id: 'SW-01',
        name: '모빌리티 01',
        x: -2.2,
        z: -1.2,
        battery: 86,
        status: '이동 중',
        target: 'p1a',
        route: ['hall', 'p1a'],
        occupied: true,
        color: '#20e3cf',
        cruise: 0.82,
      }),
      makeRobot({
        id: 'SW-02',
        name: '모빌리티 02',
        x: -6.8,
        z: -0.6,
        floor: 'B1',
        battery: 64,
        status: '승객 대기',
        target: 'b2_info',
        route: ['b2_info'],
        occupied: false,
        color: '#6aa7ff',
        cruise: 0.78,
      }),
      makeRobot({
        id: 'SW-03',
        name: '모빌리티 03',
        x: 2.2,
        z: 4.0,
        floor: 'B1',
        battery: 18,
        status: '충전 복귀',
        target: 'charge',
        route: ['charge'],
        occupied: false,
        color: '#f6bd60',
        cruise: 0.7,
      }),
    ],
    pedestrians: spawnPedestrians(20),
    extras: [],
    metrics: { nearMisses: 0, replans: 0, avoids: 0, arrivals: 0 },
    requestCount: 2,
    eventLog: [
      stampEvent('success', '가상 역사 시뮬레이터 기동 · 휠체어 3대'),
      stampEvent('info', '지하 1층 · 지하 2층 보행자 스폰'),
      stampEvent('warn', 'SW-03 배터리 18% · 지하 1층 충전 부스로 복귀'),
    ],
  };
  const robots = world.robots.map((robot) => {
    if (!['이동 중', '충전 복귀'].includes(robot.status)) return robot;
    const headingHome = robot.target === 'charge';
    const destination = headingHome ? null : nodeById(robot.target);
    const targetPoint = headingHome
      ? { ...chargeDock(robot.id), id: 'charge', radius: 0.75 }
      : {
        id: destination.id,
      x: destination.x,
      z: destination.z,
      floor: destination.floor,
      radius: destination.radius,
    };
    const missionPath = findMapPath(
      { x: robot.x, z: robot.z, floor: robot.floor },
      targetPoint,
    );
    return {
      ...robot,
      route: [headingHome ? 'charge' : destination.id],
      targetPoint,
      missionPath,
      missionPathIndex: 0,
      plannedMissionPath: missionPath,
    };
  });
  return { ...world, robots };
}

export function addRobot(world) {
  const index = world.robots.length + 1;
  const floor = FLOOR_ORDER.reduce((leastPopulated, candidate) =>
    world.robots.filter((robot) => robot.floor === candidate).length
      < world.robots.filter((robot) => robot.floor === leastPopulated).length
      ? candidate
      : leastPopulated,
  FLOOR_ORDER[0]);
  const candidates = floor === 'B1'
    ? [{ x: -6.8, z: -0.6 }, { x: -3.2, z: -6.7 }, { x: 4.0, z: -1.6 }, { x: 4.0, z: 3.3 }, { x: 8.0, z: 3.3 }]
    : [
      { x: -2.2, z: -1.2 },
      { x: -6.2, z: -2.2 },
      { x: 1.4, z: -1.6 },
      { x: 3.2, z: 1.2 },
      { x: -5.4, z: 1.8 },
  ];
  const spawn = candidates.find((candidate) =>
    mapPositionFree(candidate.x, candidate.z, floor, world.extras)
      && world.robots.every((robot) => robot.floor !== floor || hypot(robot.x, robot.z, candidate.x, candidate.z) >= 1.1),
  );
  if (!spawn) {
    return {
      world: withEvents(world, [stampEvent('warn', '빈 배치 공간이 없어 휠체어를 추가하지 못했습니다')]),
      addedId: null,
    };
  }
  const colors = ['#20e3cf', '#6aa7ff', '#f6bd60', '#bb8cff', '#ff7b91', '#86df8c'];
  const id = `SW-${String(index).padStart(2, '0')}`;
  const target = nearestNode(spawn.x, spawn.z, true, floor).id;
  const robot = makeRobot({
    id,
    name: `모빌리티 ${String(index).padStart(2, '0')}`,
    ...spawn,
    battery: 100,
    status: '대기',
    target,
    route: [target],
    occupied: false,
    color: colors[(index - 1) % colors.length],
    cruise: 0.72,
  });
  return {
    world: withEvents({ ...world, robots: [...world.robots, robot] }, [stampEvent('success', `${id} 휠체어 플릿에 추가`) ]),
    addedId: id,
  };
}

export function scenarioObstacles() {
  return [
    { id: 'bag-1', x: -1.2, z: -0.4, r: 0.42, kind: 'luggage', floor: '1F' },
    { id: 'bag-2', x: 4.0, z: -6.7, r: 0.36, kind: 'cone', floor: 'B1' },
    { id: 'bag-3', x: 4.0, z: 3.3, r: 0.4, kind: 'luggage', floor: 'B1' },
  ];
}

function repulsion(x, z, ox, oz, radius) {
  const dx = x - ox;
  const dz = z - oz;
  const d = Math.hypot(dx, dz) || 0.0001;
  if (d >= radius) return { x: 0, z: 0, d };
  const mag = ((radius - d) / radius) ** 2;
  return { x: (dx / d) * mag, z: (dz / d) * mag, d };
}

function rectangleClearance(x, z, building, radius) {
  const dx = Math.abs(x - building.x) - building.w / 2;
  const dz = Math.abs(z - building.z) - building.d / 2;
  if (dx <= 0 && dz <= 0) return -Math.min(-dx, -dz) - radius;
  return Math.hypot(Math.max(dx, 0), Math.max(dz, 0)) - radius;
}

function chooseSafeVelocity(robot, goal, pedestrians, robots, extras) {
  const dx = goal.x - robot.x;
  const dz = goal.z - robot.z;
  const distance = Math.hypot(dx, dz) || 1;
  const desiredAngle = Math.atan2(dz, dx);
  const radius = 0.42;
  const horizon = 1.5;
  let best = { x: 0, z: 0, clearance: -Infinity };
  let bestScore = -Infinity;

  for (const speedScale of [1, 0.65, 0.3]) {
    for (let angleOffset = -120; angleOffset <= 120; angleOffset += 20) {
      const angle = desiredAngle + (angleOffset * Math.PI) / 180;
      const vx = Math.cos(angle) * robot.cruise * speedScale;
      const vz = Math.sin(angle) * robot.cruise * speedScale;
      let penalty = 0;
      let minimumClearance = Infinity;

      for (let step = 1; step <= 6; step++) {
        const time = (horizon * step) / 6;
        const x = robot.x + vx * time;
        const z = robot.z + vz * time;
        const bounds = boundsFor(robot.floor);
        let clearance = Math.min(
          x - bounds.minX - radius,
          bounds.maxX - x - radius,
          z - bounds.minZ - radius,
          bounds.maxZ - z - radius,
        );
        if (!onStationDeck(x, z, robot.floor)) clearance = Math.min(clearance, -0.45);
        for (const building of buildings) {
          if ((building.floor || '1F') !== robot.floor) continue;
          clearance = Math.min(clearance, rectangleClearance(x, z, building, radius));
        }
        for (const pedestrian of pedestrians) {
          if ((pedestrian.floor || '1F') !== robot.floor) continue;
          const px = pedestrian.x + pedestrian.vx * time;
          const pz = pedestrian.z + pedestrian.vz * time;
          clearance = Math.min(clearance, hypot(x, z, px, pz) - 0.48);
        }
        for (const extra of extras) {
          if ((extra.floor || '1F') !== robot.floor) continue;
          clearance = Math.min(clearance, hypot(x, z, extra.x, extra.z) - extra.r - radius);
        }
        for (const pillar of pillars) {
          if ((pillar.floor || '1F') !== robot.floor) continue;
          clearance = Math.min(clearance, hypot(x, z, pillar.x, pillar.z) - pillar.r - radius);
        }
        for (const fence of geofences) {
          if ((fence.floor || '1F') !== robot.floor) continue;
          clearance = Math.min(clearance, hypot(x, z, fence.x, fence.z) - fence.r - radius);
        }
        for (const other of robots) {
          if (other.id === robot.id || other.floor !== robot.floor || other.elevator) continue;
          const parked = settledCharger(other);
          const peer = hypot(x, z, other.x, other.z) - (parked ? 0.95 : 0.78);
          if (parked) {
            if (peer < 0) penalty += -peer * 6;
            continue;
          }
          if (peer < 0.08) penalty += (0.08 - peer) * 14;
        }

        minimumClearance = Math.min(minimumClearance, clearance);
        if (clearance < 0.08) penalty += 80 + (0.08 - clearance) * 80;
        else if (clearance < 0.45) penalty += (0.45 - clearance) ** 2 * 8;
      }

      const endDistance = hypot(robot.x + vx * horizon, robot.z + vz * horizon, goal.x, goal.z);
      const progress = distance - endDistance;
      const alignment = (vx * dx + vz * dz) / (robot.cruise * distance);
      const score = progress * 2.5 + alignment * 0.18 - penalty;
      if (score > bestScore) {
        bestScore = score;
        best = { x: vx, z: vz, clearance: minimumClearance };
      }
    }
  }
  if (best.clearance < 0.08) return { x: 0, z: 0, clearance: best.clearance, blocked: true };
  return best;
}

function structureAvoid(x, z, floor) {
  let ax = 0;
  let az = 0;
  for (const building of buildings) {
    if ((building.floor || '1F') !== floor) continue;
    const hx = building.w / 2;
    const hz = building.d / 2;
    const dx = x - building.x;
    const dz = z - building.z;
    const nearX = clamp(dx, -hx, hx);
    const nearZ = clamp(dz, -hz, hz);
    const ox = dx - nearX;
    const oz = dz - nearZ;
    const dist = Math.hypot(ox, oz);
    const reach = 0.95;
    if (dist < 1e-3) {
      const overlapX = hx - Math.abs(dx);
      const overlapZ = hz - Math.abs(dz);
      if (overlapX < overlapZ) ax += Math.sign(dx || 1);
      else az += Math.sign(dz || 1);
    } else if (dist < reach) {
      const mag = (reach - dist) / reach;
      ax += (ox / dist) * mag;
      az += (oz / dist) * mag;
    }
  }
  for (const pillar of pillars) {
    if ((pillar.floor || '1F') !== floor) continue;
    const dx = x - pillar.x;
    const dz = z - pillar.z;
    const dist = Math.hypot(dx, dz) || 0.0001;
    const reach = pillar.r + 0.75;
    if (dist < reach) {
      const mag = (reach - dist) / reach;
      ax += (dx / dist) * mag;
      az += (dz / dist) * mag;
    }
  }
  const probe = 0.4;
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    const sx = Math.cos(angle) * probe;
    const sz = Math.sin(angle) * probe;
    if (!insideFootprint(x + sx, z + sz, floor, 0.04)) {
      ax -= Math.cos(angle) * 0.7;
      az -= Math.sin(angle) * 0.7;
    }
  }
  return { x: ax, z: az };
}

function choosePedestrianStep(x, z, tx, tz, floor, speed) {
  const dx = tx - x;
  const dz = tz - z;
  const dist = Math.hypot(dx, dz) || 1;
  const avoid = structureAvoid(x, z, floor);
  let dirX = dx / dist + avoid.x * 0.85;
  let dirZ = dz / dist + avoid.z * 0.85;
  const dirLen = Math.hypot(dirX, dirZ) || 1;
  dirX /= dirLen;
  dirZ /= dirLen;
  const desired = Math.atan2(dirZ, dirX);
  const look = 0.62;
  let best = null;
  for (const turn of [0, 0.35, -0.35, 0.75, -0.75, 1.2, -1.2, 1.7, -1.7, Math.PI]) {
    const angle = desired + turn;
    const cx = Math.cos(angle);
    const sz = Math.sin(angle);
    if (!pedestrianPositionFree(x + cx * look, z + sz * look, floor)) continue;
    if (!pedestrianPositionFree(x + cx * look * 0.45, z + sz * look * 0.45, floor)) continue;
    const progress = (dx * cx + dz * sz) / dist;
    const turnCost = Math.abs(Math.atan2(Math.sin(turn), Math.cos(turn)));
    const score = progress * 1.6 - turnCost * 0.28;
    if (!best || score > best.score) best = { vx: cx * speed, vz: sz * speed, score };
  }
  return best;
}

function nearestFreePedestrian(x, z, floor) {
  for (let radius = 0.12; radius <= 3.2; radius += 0.2) {
    for (let index = 0; index < 16; index += 1) {
      const angle = (index / 16) * Math.PI * 2;
      const nx = x + Math.cos(angle) * radius;
      const nz = z + Math.sin(angle) * radius;
      if (pedestrianPositionFree(nx, nz, floor)) return { x: nx, z: nz };
    }
  }
  return null;
}

function diagonalEscape(x, z, floor, tx, tz, step) {
  const desired = Math.atan2(tz - z, tx - x);
  let best = null;
  for (let index = 0; index < 16; index += 1) {
    const turn = (index / 16) * Math.PI * 2;
    const angle = desired + turn;
    const nx = x + Math.cos(angle) * step;
    const nz = z + Math.sin(angle) * step;
    if (!pedestrianPositionFree(nx, nz, floor)) continue;
    const progress = Math.cos(turn);
    const score = progress - Math.abs(Math.atan2(Math.sin(turn), Math.cos(turn))) * 0.15;
    if (!best || score > best.score) best = { x: nx, z: nz, vx: Math.cos(angle), vz: Math.sin(angle), score };
  }
  return best;
}

function tickPedestrians(pedestrians, robots, extras, dt) {
  return pedestrians.map((p) => {
    const floor = p.floor || '1F';
    if (!pedestrianPositionFree(p.x, p.z, floor)) {
      const rescued = nearestFreePedestrian(p.x, p.z, floor);
      if (rescued) {
        const step = Math.max(0.045, p.speed * dt);
        const escape = diagonalEscape(p.x, p.z, floor, rescued.x, rescued.z, step);
        const dx = rescued.x - p.x;
        const dz = rescued.z - p.z;
        const dist = Math.hypot(dx, dz) || 1;
        const hop = Math.min(step, dist);
        const moved = escape || {
          x: p.x + (dx / dist) * hop,
          z: p.z + (dz / dist) * hop,
          vx: dx / dist,
          vz: dz / dist,
        };
        return {
          ...p,
          x: moved.x,
          z: moved.z,
          vx: moved.vx * p.speed,
          vz: moved.vz * p.speed,
          stuck: 0,
        };
      }
    }
    let pause = p.pause - dt;
    let tx = p.tx;
    let tz = p.tz;
    let stuck = p.stuck || 0;
    let bestGoal = p.bestGoal ?? hypot(p.x, p.z, tx, tz);
    let goalStall = p.goalStall || 0;
    const goalFar = !sameDeck(floor, p.x, p.z, tx, tz) || !pedestrianPositionFree(tx, tz, floor);
    if (hypot(p.x, p.z, tx, tz) < 0.45 || goalFar || goalStall > 2.4) {
      const g = randomWander(floor, p);
      tx = g.x;
      tz = g.z;
      bestGoal = hypot(p.x, p.z, tx, tz);
      goalStall = 0;
      if (hypot(p.x, p.z, p.tx, p.tz) < 0.45) pause = Math.random() < 0.22 ? 1.2 + Math.random() * 2.4 : 0.15;
    }

    let vx = 0;
    let vz = 0;
    if (pause <= 0) {
      const step = choosePedestrianStep(p.x, p.z, tx, tz, floor, p.speed);
      if (step) {
        vx = step.vx;
        vz = step.vz;
      }
    }

    let sepX = 0;
    let sepZ = 0;
    for (const o of pedestrians) {
      if (o.id === p.id || (o.floor || '1F') !== floor) continue;
      const r = repulsion(p.x, p.z, o.x, o.z, 0.7);
      sepX += r.x * 1.4;
      sepZ += r.z * 1.4;
    }
    for (const rbt of robots) {
      if (rbt.floor !== floor) continue;
      const r = repulsion(p.x, p.z, rbt.x, rbt.z, 1.05);
      sepX += r.x * 2.1;
      sepZ += r.z * 2.1;
    }
    for (const extra of extras) {
      if ((extra.floor || '1F') !== floor) continue;
      const r = repulsion(p.x, p.z, extra.x, extra.z, extra.r + 0.45);
      sepX += r.x * 1.8;
      sepZ += r.z * 1.8;
    }

    const crowdingRobot = robots.find((robot) => robot.floor === floor && hypot(p.x, p.z, robot.x, robot.z) < 1.15);
    if (crowdingRobot && pause > 0) pause = 0;
    const combined = Math.hypot(vx + sepX, vz + sepZ);
    const speedCap = p.speed * 1.15;
    if (combined > speedCap) {
      const scale = speedCap / combined;
      vx = (vx + sepX) * scale;
      vz = (vz + sepZ) * scale;
    } else {
      vx += sepX;
      vz += sepZ;
    }
    let x = p.x + vx * dt;
    let z = p.z + vz * dt;
    if (!pedestrianPositionFree(x, z, floor)) {
      const escape = diagonalEscape(p.x, p.z, floor, tx, tz, Math.max(0.045, p.speed * dt));
      if (escape) {
        x = escape.x;
        z = escape.z;
        vx = escape.vx * p.speed;
        vz = escape.vz * p.speed;
      } else {
        x = p.x;
        z = p.z;
        vx = 0;
        vz = 0;
      }
    }

    const moved = hypot(x, z, p.x, p.z);
    const goalDistance = hypot(x, z, tx, tz);
    if (goalDistance < bestGoal - 0.22) {
      bestGoal = goalDistance;
      goalStall = 0;
    } else if (pause <= 0) goalStall += dt;
    if (pause <= 0 && moved < 0.01) stuck += dt;
    else stuck = 0;
    if (stuck > 0.75) {
      const g = randomWander(floor, p);
      tx = g.x;
      tz = g.z;
      bestGoal = hypot(p.x, p.z, tx, tz);
      goalStall = 0;
      stuck = 0;
      pause = 0.25;
      x = p.x;
      z = p.z;
      vx = 0;
      vz = 0;
    }

    const pushed = pushOut(x, z, 0.16, floor);
    if (pedestrianPositionFree(pushed.x, pushed.z, floor) && hypot(pushed.x, pushed.z, x, z) < 0.08) {
      x = pushed.x;
      z = pushed.z;
    }
    const realSpeed = hypot(x, z, p.x, p.z) / Math.max(dt, 1e-4);
    if (realSpeed < 0.12) {
      vx = 0;
      vz = 0;
    } else {
      vx = (x - p.x) / Math.max(dt, 1e-4);
      vz = (z - p.z) / Math.max(dt, 1e-4);
    }
    return { ...p, x, z, vx, vz, tx, tz, pause, stuck, bestGoal, goalStall };
  });
}

function movingStatus(status) {
  return status === '이동 중' || status === '충전 복귀' || status === '회피 중'
    || status === '경로 재계획' || status === '보행자 대기';
}

function upcomingDoor(robot) {
  const path = robot.missionPath;
  if (!path?.length || robot.elevator) return null;
  const index = Math.min(robot.missionPathIndex || 0, path.length - 1);
  for (let cursor = index; cursor < Math.min(path.length, index + 4); cursor += 1) {
    const goal = path[cursor];
    if (!goal || (goal.floor || robot.floor) === robot.floor) continue;
    return doorOnRobotFloor(goal, robot.floor);
  }
  return null;
}

function elevatorQueuePlace(robot, robots) {
  const door = upcomingDoor(robot);
  if (!door || hypot(robot.x, robot.z, door.x, door.z) > 3.4) return 0;
  const riding = robots.some((other) => (
    other.id !== robot.id
    && other.elevator
    && other.floor === robot.floor
    && hypot(other.x, other.z, door.x, door.z) < 1.3
  ));
  const waiting = robots.filter((other) => {
    if (other.elevator || other.floor !== robot.floor) return false;
    if (hypot(other.x, other.z, door.x, door.z) > 3.4) return false;
    const source = other.id === robot.id ? robot : other;
    const otherDoor = upcomingDoor(source);
    return otherDoor && otherDoor.id === door.id;
  });
  waiting.sort((a, b) => {
    const gapA = hypot(a.x, a.z, door.x, door.z);
    const gapB = hypot(b.x, b.z, door.x, door.z);
    if (Math.abs(gapA - gapB) > 0.2) return gapA - gapB;
    return a.id < b.id ? -1 : 1;
  });
  const place = waiting.findIndex((other) => other.id === robot.id);
  return (place < 0 ? 0 : place) + (riding ? 1 : 0);
}

function queueDirection(door, robot, robots) {
  let sx = 0;
  let sz = 0;
  for (const other of robots) {
    if (other.elevator || other.floor !== robot.floor) continue;
    const dx = other.x - door.x;
    const dz = other.z - door.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.2 || len > 5.5) continue;
    const source = other.id === robot.id ? robot : other;
    const otherDoor = upcomingDoor(source);
    if (!otherDoor || otherDoor.id !== door.id) continue;
    sx += dx / len;
    sz += dz / len;
  }
  const len = Math.hypot(sx, sz);
  if (len < 0.2) {
    const dx = robot.x - door.x;
    const dz = robot.z - door.z;
    const own = Math.hypot(dx, dz) || 1;
    return { x: dx / own, z: dz / own };
  }
  return { x: sx / len, z: sz / len };
}

function queueHoldPoint(door, robot, robots, radius, extras) {
  const axis = queueDirection(door, robot, robots);
  const base = Math.atan2(axis.z, axis.x);
  for (const turn of [0, 0.35, -0.35, 0.7, -0.7]) {
    const x = door.x + Math.cos(base + turn) * radius;
    const z = door.z + Math.sin(base + turn) * radius;
    if (mapPositionFree(x, z, robot.floor, extras)) return { x, z };
  }
  return {
    x: door.x + Math.cos(base) * radius,
    z: door.z + Math.sin(base) * radius,
  };
}

function tickRobot(robot, ctx) {
  const { dt, robots, pedestrians, extras, flags, events, metrics } = ctx;
  let next = {
    ...robot,
    replanCool: Math.max(0, robot.replanCool - dt),
    missCool: Math.max(0, robot.missCool - dt),
  };

  if (flags.estop) {
    return { ...next, speed: 0, status: '비상 정지', avoiding: false };
  }

  if (next.returnPrompt) {
    return {
      ...next,
      returnHold: Math.max(0, (next.returnHold ?? 10) - dt),
      speed: 0,
      status: '하차 대기',
      avoiding: false,
    };
  }

  if (next.elevator) {
    const elapsed = Math.min(next.elevator.duration, next.elevator.elapsed + dt);
    if (elapsed < next.elevator.duration) {
      return {
        ...next,
        elevator: { ...next.elevator, elapsed },
        speed: 0,
        status: '엘리베이터 이동',
      };
    }
    const destination = nodeById(next.elevator.destinationId);
    events.push(stampEvent('info', `${next.id} ${next.elevator.toFloor} 엘리베이터 도착`));
    return {
      ...next,
      x: destination.x,
      z: destination.z,
      floor: next.elevator.toFloor,
      elevator: null,
      routeIndex: next.routeIndex + 1,
      missionPathIndex: next.missionPath ? next.missionPathIndex + 1 : next.missionPathIndex,
      speed: 0,
      status: next.target === 'charge' ? '충전 복귀' : '이동 중',
    };
  }

  let battery = next.battery;
  if (next.status === '충전 중') battery = Math.min(100, battery + 6.5 * dt);
  else if (movingStatus(next.status)) battery = Math.max(4, battery - 0.55 * dt);
  else battery = Math.max(4, battery - 0.12 * dt);

  if (
    battery < 10 &&
    next.status !== '충전 중' &&
    next.target !== 'charge' &&
    !next.elevator &&
    next.replanCool <= 0
  ) {
    const dock = { ...chargeDock(next.id), id: 'charge', radius: 0.75 };
    const missionPath = findMapPath(
      departurePoint(next, next.missionPath, next.missionPathIndex, next.targetPoint?.id || next.target),
      dock,
      extras,
    );
    if (missionPath?.length) {
      events.push(stampEvent('warn', `${next.id} 배터리 ${Math.round(battery)}% · 지하 1층 충전 부스로 자동 복귀`));
      next = {
        ...next,
        battery,
        status: '충전 복귀',
        target: 'charge',
        targetPoint: dock,
        missionPath,
        missionPathIndex: 0,
        missionStartIndex: 0,
        plannedMissionPath: missionPath,
        occupied: false,
        passenger: null,
        returnPrompt: false,
        returnHold: 0,
        route: ['charge'],
        routeIndex: 0,
        stuck: 0,
        originPoint: null,
      };
    } else {
      next = { ...next, battery, replanCool: 2 };
    }
  } else {
    next = { ...next, battery };
  }

  const ownDock = chargeDock(next.id);
  if (
    next.target === 'charge'
    && next.status !== '충전 중'
    && !next.elevator
    && next.floor === ownDock.floor
    && hypot(next.x, next.z, ownDock.x, ownDock.z) < 1.05
  ) {
    events.push(stampEvent('success', `${next.id} 충전 스테이션 도착`));
    return {
      ...next,
      x: ownDock.x,
      z: ownDock.z,
      floor: ownDock.floor,
      speed: 0,
      status: '충전 중',
      targetPoint: null,
      originPoint: null,
      missionPath: null,
      missionPathIndex: 0,
      missionStartIndex: 0,
      plannedMissionPath: null,
      occupied: false,
      passenger: null,
      returnPrompt: false,
      returnHold: 0,
      avoiding: false,
      stuck: 0,
      homeSeq: (next.homeSeq || 0) + 1,
    };
  }

  if (next.status === '충전 중') {
    if (battery >= 99.5) {
      events.push(stampEvent('success', `${next.id} 충전 완료 · 대기 전환`));
      return {
        ...next,
        battery: 100,
        status: '대기',
        speed: 0,
        occupied: false,
        target: null,
        targetPoint: null,
        missionPath: null,
        plannedMissionPath: null,
        route: [],
        routeIndex: 0,
      };
    }
    return { ...next, speed: 0, x: ownDock.x, z: ownDock.z, floor: ownDock.floor };
  }

  if (!movingStatus(next.status)) {
    return { ...next, speed: 0, avoiding: false };
  }

  let route = next.route || [];
  let missionPath = next.missionPath;
  let missionPathIndex = next.missionPathIndex || 0;
  let missionStartIndex = next.missionStartIndex || 0;
  let originPoint = next.originPoint;
  let targetPoint = next.targetPoint;
  const missionPathActive = Array.isArray(missionPath) && missionPath.length > 0;
  const waypointBlocked = missionPathActive
    && missionPathIndex < missionPath.length
    && missionPath[missionPathIndex].floor === next.floor
    && !missionPath[missionPathIndex].elevator
    && !segmentIsFree(
      { x: next.x, z: next.z },
      missionPath[missionPathIndex],
      next.floor,
      extras,
    );
  if (waypointBlocked) {
    const ahead = missionPath[missionPathIndex + 1];
    if (
      ahead
      && ahead.floor === next.floor
      && !ahead.elevator
      && segmentIsFree({ x: next.x, z: next.z }, ahead, next.floor, extras)
    ) {
      missionPathIndex += 1;
    }
  }
  if (
    waypointBlocked
    && missionPathIndex < missionPath.length
    && missionPath[missionPathIndex].floor === next.floor
    && !segmentIsFree(
      { x: next.x, z: next.z },
      missionPath[missionPathIndex],
      next.floor,
      extras,
    )
    && next.replanCool <= 0
  ) {
    const currentPoint = departurePoint({ x: next.x, z: next.z, floor: next.floor }, missionPath, missionPathIndex);
    const mustReachOrigin = next.originPoint && missionPathIndex < missionStartIndex;
    const toMilestone = findMapPath(
      currentPoint,
      mustReachOrigin ? { ...originPoint, snapRadius: 2 } : { ...targetPoint, snapRadius: 2 },
      extras,
    );
    if (mustReachOrigin && toMilestone?.length) {
      const reachableOrigin = toMilestone[toMilestone.length - 1];
      originPoint = { ...originPoint, x: reachableOrigin.x, z: reachableOrigin.z, floor: reachableOrigin.floor };
    } else if (toMilestone?.length) {
      const reachableDestination = toMilestone[toMilestone.length - 1];
      targetPoint = { ...targetPoint, x: reachableDestination.x, z: reachableDestination.z, floor: reachableDestination.floor };
    }
    const afterMilestone = mustReachOrigin
      ? findMapPath(originPoint, { ...targetPoint, snapRadius: 2 }, extras)
      : [];
    if (toMilestone?.length && afterMilestone) {
      missionPath = [...toMilestone, ...afterMilestone];
      missionStartIndex = mustReachOrigin ? toMilestone.length : 0;
      if (mustReachOrigin && afterMilestone.length) {
        const reachableDestination = afterMilestone[afterMilestone.length - 1];
        targetPoint = { ...targetPoint, x: reachableDestination.x, z: reachableDestination.z, floor: reachableDestination.floor };
      }
      missionPathIndex = 0;
      next.replanCool = 1.2;
      next.stuck = 0;
      metrics.replans += 1;
      events.push(stampEvent('warn', `${next.id} 장애물 감지 · 최단 경로 재계획`));
    }
  }
  const currentRouteIndex = Math.min(next.routeIndex, Math.max(0, route.length - 1));
  const isPastLastWaypoint = missionPathActive
    ? missionPathIndex >= missionPath.length - 1
    : currentRouteIndex >= route.length - 1;
  const goalId = route[Math.min(currentRouteIndex + 1, route.length - 1)] || next.target;
  const goal = missionPathActive
    ? missionPath[Math.min(missionPathIndex, missionPath.length - 1)]
    : targetPoint && isPastLastWaypoint
      ? targetPoint
      : nodeById(goalId);
  const gdx = goal.x - next.x;
  const gdz = goal.z - next.z;
  const gd = Math.hypot(gdx, gdz) || 1;
  const legacyElevatorFloor = !missionPathActive && !isPastLastWaypoint
    && nodeById(goalId).floor !== next.floor
    && ELEVATOR_NODE_IDS.has(route[currentRouteIndex])
    ? nodeById(goalId).floor
    : null;
  const localDoor = doorOnRobotFloor(goal, next.floor);
  const queueDoor = localDoor || upcomingDoor(next);
  const boardGap = (localDoor || queueDoor)
    ? hypot((localDoor || queueDoor).x, (localDoor || queueDoor).z, next.x, next.z)
    : gd;
  const queuePlace = elevatorQueuePlace(next, robots);
  const queued = queuePlace > 0 && Boolean(queueDoor);
  const queueSlot = queued
    ? queueHoldPoint(queueDoor, next, robots, 1.5 + (queuePlace - 1) * 1.35, extras)
    : null;
  const steer = queueSlot || localDoor || goal;

  if (
    !queued
    && ((missionPathActive && goal.floor !== next.floor) || legacyElevatorFloor)
    && boardGap < 0.9
  ) {
    const destinationFloor = missionPathActive ? goal.floor : legacyElevatorFloor;
    const destinationId = goal.id || goalId;
    events.push(stampEvent('info', `${next.id} 엘리베이터 탑승 · ${destinationFloor} 이동`));
    return {
      ...next,
      elevator: {
        fromFloor: next.floor,
        toFloor: destinationFloor,
        destinationId,
        elapsed: 0,
        duration: 3.2,
      },
      speed: 0,
      status: '엘리베이터 이동',
      avoiding: false,
    };
  }

  const steerDistance = Math.hypot(steer.x - next.x, steer.z - next.z) || 1;
  let wx = ((steer.x - next.x) / steerDistance) * next.cruise;
  let wz = ((steer.z - next.z) / steerDistance) * next.cruise;

  let nearest = 8;
  let avoidX = 0;
  let avoidZ = 0;
  const currentPedestrians = pedestrians.filter((p) => (p.floor || '1F') === next.floor);
  const directionX = (steer.x - next.x) / steerDistance;
  const directionZ = (steer.z - next.z) / steerDistance;
  const pedestrianBlocked = currentPedestrians.some((pedestrian) => {
    const dx = pedestrian.x - next.x;
    const dz = pedestrian.z - next.z;
    const forward = dx * directionX + dz * directionZ;
    const side = Math.abs(dx * directionZ - dz * directionX);
    const distance = Math.hypot(dx, dz);
    const approaching = pedestrian.vx * -directionX + pedestrian.vz * -directionZ > 0.12;
    return distance < 0.95 || (forward > 0 && forward < 1.55 && side < 0.55)
      || (approaching && forward > 0 && forward < 2.1 && side < 0.7);
  });
  const hardContact = currentPedestrians.some((pedestrian) => hypot(pedestrian.x, pedestrian.z, next.x, next.z) < 0.5);
  let pedestrianWait = pedestrianBlocked ? (next.pedestrianWait || 0) + dt : 0;
  const yielding = pedestrianBlocked && pedestrianWait < (hardContact ? 1.35 : 0.75);

  const addAvoid = (ax, az, radius, weight) => {
    const r = repulsion(next.x, next.z, ax, az, radius);
    nearest = Math.min(nearest, r.d);
    avoidX += r.x * weight;
    avoidZ += r.z * weight;
  };

  if (!pedestrianBlocked && pedestrianWait <= 0) {
    for (const p of currentPedestrians) addAvoid(p.x, p.z, 1.0, 0.55);
  }
  for (const e of extras) {
    if ((e.floor || '1F') === next.floor) addAvoid(e.x, e.z, e.r + 1.15, 2.4);
  }
  for (const col of pillars) {
    if ((col.floor || '1F') === next.floor) addAvoid(col.x, col.z, col.r + 0.85, 2.2);
  }
  for (const g of geofences) {
    if ((g.floor || '1F') === next.floor) addAvoid(g.x, g.z, g.r + 0.35, 2.6);
  }
  for (const other of robots) {
    if (other.id === next.id || other.floor !== next.floor || other.elevator || settledCharger(other)) continue;
    const gap = hypot(next.x, next.z, other.x, other.z);
    if (gap < 0.92) {
      const push = repulsion(next.x, next.z, other.x, other.z, 0.92);
      avoidX += push.x * 1.1;
      avoidZ += push.z * 1.1;
    }
  }

  const safeVelocity = chooseSafeVelocity(next, steer, currentPedestrians, robots, extras);
  const nearElevatorDoor = Boolean(localDoor) && boardGap < 1.7;
  const holdingForPedestrian = (yielding || hardContact) && !nearElevatorDoor && pedestrianWait < 1.35;
  let chase = next.chase || { best: steerDistance, stall: 0, commit: 0 };
  if (steerDistance < chase.best - 0.18) chase = { best: steerDistance, stall: 0, commit: Math.max(0, chase.commit - dt) };
  else if (chase.commit > 0) chase = { best: Math.min(chase.best, steerDistance), stall: 0, commit: Math.max(0, chase.commit - dt) };
  else chase = chase.stall + dt > 2.2
    ? { best: steerDistance, stall: 0, commit: 1.8 }
    : { best: chase.best, stall: chase.stall + dt, commit: 0 };
  if (holdingForPedestrian) {
    wx = 0;
    wz = 0;
  } else {
    wx = safeVelocity.x + avoidX * next.cruise * 0.25;
    wz = safeVelocity.z + avoidZ * next.cruise * 0.25;
    if (Math.hypot(wx, wz) < 0.08) {
      let bestSide = 0;
      let bestRoom = -1;
      for (const sign of [1, -1]) {
        const sx = next.x - directionZ * sign * 0.7;
        const sz = next.z + directionX * sign * 0.7;
        if (!mapPositionFree(sx, sz, next.floor, extras)) continue;
        const room = Math.min(...currentPedestrians.map((pedestrian) => hypot(sx, sz, pedestrian.x, pedestrian.z)), 4);
        if (room > bestRoom) {
          bestRoom = room;
          bestSide = sign;
        }
      }
      if (bestSide) {
        wx = -directionZ * bestSide * next.cruise * 0.62;
        wz = directionX * bestSide * next.cruise * 0.62;
      }
    }
  }
  const peerAhead = robots.some((other) => {
    if (other.id === next.id || other.floor !== next.floor || other.elevator || settledCharger(other)) return false;
    const dx = other.x - next.x;
    const dz = other.z - next.z;
    const gap = Math.hypot(dx, dz);
    return gap < 1.25 && dx * directionX + dz * directionZ > 0.15;
  });
  if (chase.commit > 0 && !hardContact && !peerAhead && !queued) {
    wx = directionX * next.cruise * 0.86;
    wz = directionZ * next.cruise * 0.86;
  }
  let peerGap = 8;
  for (const other of robots) {
    if (other.id === next.id || other.floor !== next.floor || other.elevator || settledCharger(other)) continue;
    peerGap = Math.min(peerGap, hypot(next.x, next.z, other.x, other.z));
  }
  if (peerGap < 1.35 && !queued) {
    const pass = (1.35 - peerGap) / 1.35;
    wx += directionZ * pass * next.cruise * 0.75;
    wz += -directionX * pass * next.cruise * 0.75;
  }
  if (queued && queueSlot && hypot(next.x, next.z, queueSlot.x, queueSlot.z) < 0.32) {
    wx = 0;
    wz = 0;
  }

  const avoidMag = Math.hypot(avoidX, avoidZ);
  const predictiveAvoiding = Math.hypot(
    safeVelocity.x - (gdx / gd) * next.cruise,
    safeVelocity.z - (gdz / gd) * next.cruise,
  ) > 0.18;
  const avoiding = !holdingForPedestrian
    && (safeVelocity.blocked || predictiveAvoiding || avoidMag > 0.28 || nearest < 1.25);
  if (safeVelocity.blocked && !pedestrianBlocked && next.replanCool <= 0) {
    next.replanCool = 1.2;
    next.stuck += dt;
  }
  if (avoiding) metrics.avoids += dt;

  if (nearest < 0.72 && next.missCool <= 0) {
    metrics.nearMisses += 1;
    next.missCool = 2.4;
    events.push(stampEvent('warn', `${next.id} 근접 회피 · 이격 ${nearest.toFixed(1)}m`));
  }

  let speedVec = Math.hypot(wx, wz);
  if (speedVec > next.cruise) {
    wx = (wx / speedVec) * next.cruise;
    wz = (wz / speedVec) * next.cruise;
    speedVec = next.cruise;
  }
  if (chase.commit <= 0 && nearest < 0.7 && !holdingForPedestrian) {
    const scale = pedestrianBlocked ? 0.72 : 0.15;
    wx *= scale;
    wz *= scale;
    speedVec *= scale;
  } else if (chase.commit <= 0 && nearest < 1.1 && !holdingForPedestrian) {
    const scale = pedestrianBlocked ? 0.85 : 0.45;
    wx *= scale;
    wz *= scale;
    speedVec *= scale;
  }

  let x = next.x + wx * dt;
  let z = next.z + wz * dt;
  ({ x, z } = pushOut(x, z, 0.42, next.floor));
  for (const g of geofences) {
    if ((g.floor || '1F') !== next.floor) continue;
    const d = hypot(x, z, g.x, g.z);
    if (d < g.r) {
      const k = g.r / (d || 0.001);
      x = g.x + (x - g.x) * k;
      z = g.z + (z - g.z) * k;
    }
  }

  const moved = hypot(x, z, next.x, next.z);
  let stuck = holdingForPedestrian || moved >= 0.004
    ? Math.max(0, (next.stuck || 0) - dt)
    : (next.stuck || 0) + dt;
  let status = holdingForPedestrian
    ? '보행자 대기'
    : safeVelocity.blocked ? '경로 재계획'
      : avoiding ? '회피 중' : next.target === 'charge' ? '충전 복귀' : '이동 중';
  let routeIndex = next.routeIndex;
  let nextRoute = route;

  const goalTolerance = missionPathActive
    ? 0.2
      : targetPoint && isPastLastWaypoint
    ? targetPoint.radius || 0.52
    : isPastLastWaypoint ? (nodeById(next.target).radius || 0.7) : 0.32;
  const mapDestinationReached = !missionPathActive || !isPastLastWaypoint
    || Math.hypot(next.x - targetPoint.x, next.z - targetPoint.z)
      <= (targetPoint.radius || 0.62);
  if (gd < goalTolerance && mapDestinationReached) {
    if (isPastLastWaypoint) {
      const arrived = nodeLabel(next.target);
      metrics.arrivals += 1;
      if (next.target === 'charge') {
        events.push(stampEvent('success', `${next.id} 충전 스테이션 도착`));
        return {
          ...next,
          x: goal.x,
          z: goal.z,
          targetPoint: null,
          originPoint: null,
          missionPath: null,
          missionPathIndex: 0,
          missionStartIndex: 0,
          plannedMissionPath: null,
          speed: 0,
          status: '충전 중',
          occupied: false,
          passenger: null,
          returnPrompt: false,
          returnHold: 0,
          nearestDist: nearest,
          avoiding: false,
          heading: next.heading,
          stuck: 0,
          homeSeq: (next.homeSeq || 0) + 1,
        };
      }
      events.push(stampEvent('success', `${next.id} 목적지 도착 · ${arrived}`));
      const dropoff = Boolean(next.occupied || next.passenger);
      return {
        ...next,
        x: goal.x,
        z: goal.z,
        targetPoint: null,
        originPoint: null,
        missionPath: null,
        missionPathIndex: 0,
        missionStartIndex: 0,
        plannedMissionPath: null,
        speed: 0,
        status: dropoff ? '하차 대기' : '대기',
        occupied: false,
        passenger: dropoff ? next.passenger : null,
        returnPrompt: dropoff,
        returnHold: dropoff ? 10 : 0,
        nearestDist: nearest,
        avoiding: false,
        heading: next.heading,
        stuck: 0,
        routeIndex: route.length - 1,
      };
    }
    if (missionPathActive) {
      missionPathIndex += 1;
    } else {
      routeIndex += 1;
    }
  } else if ((stuck > (drivingRules.replan ? 4 : 1.15) || (safeVelocity.blocked && stuck > 1.6)) && next.replanCool <= 0) {
    if (missionPathActive) {
      const currentPoint = departurePoint({ x, z, floor: next.floor }, missionPath, missionPathIndex);
      const mustReachOrigin = originPoint && missionPathIndex < missionStartIndex;
      const toMilestone = findMapPath(
        currentPoint,
        mustReachOrigin ? { ...originPoint, snapRadius: 2 } : { ...targetPoint, snapRadius: 2 },
        extras,
      );
      if (mustReachOrigin && toMilestone?.length) {
        const reachableOrigin = toMilestone[toMilestone.length - 1];
        originPoint = { ...originPoint, x: reachableOrigin.x, z: reachableOrigin.z, floor: reachableOrigin.floor };
      } else if (toMilestone?.length) {
        const reachableDestination = toMilestone[toMilestone.length - 1];
        targetPoint = { ...targetPoint, x: reachableDestination.x, z: reachableDestination.z, floor: reachableDestination.floor };
      }
      const afterMilestone = mustReachOrigin
        ? findMapPath(originPoint, { ...targetPoint, snapRadius: 2 }, extras)
        : [];
      if (toMilestone?.length && afterMilestone) {
        missionPath = [...toMilestone, ...afterMilestone];
        missionStartIndex = mustReachOrigin ? toMilestone.length : 0;
        if (mustReachOrigin && afterMilestone.length) {
          const reachableDestination = afterMilestone[afterMilestone.length - 1];
          targetPoint = { ...targetPoint, x: reachableDestination.x, z: reachableDestination.z, floor: reachableDestination.floor };
        }
        missionPathIndex = 0;
        metrics.replans += 1;
        next.replanCool = 2.8;
      } else {
        next.replanCool = 1.2;
      }
    } else {
      const from = nearestNode(x, z, true, next.floor).id;
      nextRoute = findRoute(from, next.target, pedestrians, true);
    }
    if (!missionPathActive && nextRoute.length) {
      metrics.replans += 1;
      next.replanCool = 2.8;
    } else if (!missionPathActive) {
      next.replanCool = 1.2;
    }
    stuck = 0;
    if (!missionPathActive) routeIndex = 0;
    status = '경로 재계획';
    events.push(stampEvent('warn', `${next.id} 혼잡으로 경로 재계획`));
  }

  const heading = speedVec > 0.05 ? Math.atan2(wx, wz) + Math.PI : next.heading;
  return {
    ...next,
    x,
    z,
    heading,
    speed: speedVec,
    nearestDist: nearest,
    avoiding,
    stuck,
    chase,
    status,
    pedestrianWait,
    route: nextRoute,
    routeIndex,
    missionPath,
    missionPathIndex,
    missionStartIndex,
    originPoint,
    targetPoint,
  };
}

export function tickWorld(world, dt, flags) {
  const events = [];
  const metrics = { ...world.metrics };
  const extras = flags.obstacle ? world.extras : [];
  const pedestrians = tickPedestrians(world.pedestrians, world.robots, extras, dt);
  const robots = [];
  for (const robot of world.robots) {
    robots.push(
      tickRobot(robot, {
        dt,
        robots: world.robots,
        pedestrians,
        extras,
        flags,
        events,
        metrics,
      }),
    );
  }

  let nextPeds = pedestrians;
  if (flags.obstacle && pedestrians.length < 28 && Math.random() < dt * 0.4) {
    const floor = FLOOR_ORDER[Math.floor(Math.random() * FLOOR_ORDER.length)];
    const spawn = randomWander(floor);
    const goal = randomWander(floor);
    nextPeds = [
      ...pedestrians,
      {
        id: `P-X${pedestrians.length}`,
        ...spawn,
        vx: 0,
        vz: 0,
        tx: goal.x,
        tz: goal.z,
        speed: 0.7,
        pause: 0,
        hue: 1,
        floor,
      },
    ];
  }

  const eventLog = events.length ? [...events, ...(world.eventLog || [])].slice(0, 24) : world.eventLog || [];
  let nextWorld = {
    ...world,
    robots,
    pedestrians: nextPeds,
    metrics,
    eventLog,
  };
  if (!flags.estop) {
    for (const robot of robots) {
      if (robot.returnPrompt && robot.returnHold <= 0) {
        nextWorld = returnToCharge(nextWorld, robot.id, '자동').world;
      }
    }
  }
  return nextWorld;
}

export function assignMission(world, robotId, from, to) {
  const events = [];
  const idle = world.robots.find((r) => r.id === robotId)
    || world.robots.find((r) => r.battery >= 10 && (r.status === '대기' || r.status === '승객 대기'))
    || world.robots.find((r) => r.battery >= 10)
    || world.robots[0];
  if (idle.battery < 10) {
    events.push(stampEvent('warn', `${idle.id} 배터리 ${Math.round(idle.battery)}% · 충전 중이라 배차할 수 없습니다`));
    return { world: withEvents(world, events), assignedId: null };
  }
  const start = nearestNode(idle.x, idle.z, true, idle.floor).id;
  const destination = typeof to === 'string'
    ? nodeById(to)
    : nearestNode(to.x, to.z, true, to.floor || idle.floor);
  const targetPoint = typeof to === 'string'
    ? null
    : { id: to.id, x: to.x, z: to.z, floor: to.floor || idle.floor, radius: to.radius || 0.62 };
  const originPoint = from && typeof from === 'object'
    ? { id: from.id, x: from.x, z: from.z, floor: from.floor || idle.floor, radius: from.radius || 0.5 }
    : null;
  const toOriginPath = originPoint && targetPoint
    ? findMapPath({ x: idle.x, z: idle.z, floor: idle.floor }, originPoint, world.extras)
    : null;
  const onwardPath = originPoint && targetPoint
    ? findMapPath(originPoint, targetPoint, world.extras)
    : null;
  const missionPath = originPoint && targetPoint && toOriginPath && onwardPath
    ? [...toOriginPath, ...onwardPath]
    : null;
  const route = originPoint && targetPoint
    ? missionPath ? [destination.id] : []
    : findRoute(start, destination.id, world.pedestrians, true);
  if ((missionPath && !missionPath.length) || !route.length) {
    events.push(stampEvent('warn', `${idle.id} 목적지까지 연결 경로가 없습니다`));
    return {
      world: withEvents(world, events),
      assignedId: idle.id,
    };
  }
  const robots = world.robots.map((r) =>
    r.id === idle.id
      ? {
          ...r,
          route,
          routeIndex: 0,
          target: destination.id,
          targetPoint,
          originPoint,
          missionPath,
          missionPathIndex: 0,
          missionStartIndex: toOriginPath?.length || 0,
          plannedMissionPath: originPoint && onwardPath
            ? [originPoint, ...onwardPath]
            : onwardPath,
          status: '이동 중',
          occupied: true,
          stuck: 0,
          replanCool: 0,
          elevator: null,
        }
      : r,
  );
  events.push(stampEvent('success', `${idle.id} 배차 · ${originPoint ? '맵 출발지' : nodeLabel(start)} → ${targetPoint ? '맵 목적지' : nodeLabel(destination.id)}`));
  return {
    world: withEvents(
      { ...world, robots, requestCount: Math.max(0, world.requestCount - 1) },
      events,
    ),
    assignedId: idle.id,
  };
}

export const CHARGE_DOCKS = {
  'SW-01': { x: -9.35, z: -5.15, floor: '1F' },
  'SW-02': { x: -9.35, z: -3.55, floor: '1F' },
  'SW-03': { x: -9.35, z: -1.95, floor: '1F' },
};

function settledCharger(robot) {
  const dock = chargeDock(robot.id);
  if ((robot.floor || '1F') !== dock.floor) return false;
  if (robot.status !== '충전 중' && robot.status !== '대기') return false;
  return hypot(robot.x, robot.z, dock.x, dock.z) < 0.75;
}

export function chargeDock(robotId) {
  return CHARGE_DOCKS[robotId] || { x: -9.35, z: -3.55, floor: '1F' };
}

export function returnToCharge(world, robotId, source = '수동') {
  const events = [];
  const robots = world.robots.map((r) => {
    if (r.id !== robotId) return r;
    const dock = { ...chargeDock(r.id), radius: 0.62 };
    const parked = r.floor === dock.floor && hypot(r.x, r.z, dock.x, dock.z) < 0.75;
    const phrase = source === '자동'
      ? `${r.id} 복귀 버튼을 누르지 않아 충전존으로 자동 복귀`
      : source === '비상'
        ? `${r.id} 역무원 비상 원위치 · 충전존으로 이동`
        : `${r.id} 역무원 복귀 · 충전존으로 이동`;
    events.push(stampEvent(source === '비상' ? 'warn' : 'info', phrase));
    const cleared = {
      occupied: false,
      passenger: null,
      returnPrompt: false,
      returnHold: 0,
      target: 'charge',
      route: ['charge'],
      routeIndex: 0,
      stuck: 0,
      originPoint: null,
      elevator: null,
      replanCool: 0,
    };
    if (parked || r.status === '충전 중') {
      const arriving = r.status !== '충전 중';
      return {
        ...r,
        ...cleared,
        x: dock.x,
        z: dock.z,
        floor: dock.floor,
        speed: 0,
        status: '충전 중',
        targetPoint: null,
      missionPath: null,
      missionPathIndex: 0,
      missionStartIndex: 0,
      plannedMissionPath: null,
        homeSeq: arriving ? (r.homeSeq || 0) + 1 : (r.homeSeq || 0),
      };
    }
    const missionPath = findMapPath(
      departurePoint(r, r.missionPath, r.missionPathIndex, r.targetPoint?.id || r.target),
      dock,
      world.extras,
    );
    if (!missionPath?.length) {
      events.push(stampEvent('warn', `${r.id} 충전존까지 연결 경로가 없습니다`));
      return { ...r, returnPrompt: false, returnHold: 0 };
    }
    return {
      ...r,
      ...cleared,
      status: '충전 복귀',
      targetPoint: dock,
      missionPath,
      missionPathIndex: 0,
      missionStartIndex: 0,
      plannedMissionPath: missionPath,
    };
  });
  return { world: withEvents({ ...world, robots }, events) };
}

export function congestionScore(pedestrians) {
  if (!pedestrians.length) return 0;
  const corridor = pedestrians.filter((p) => Math.abs(p.z) < 2.2 && p.x > -6 && p.x < 6);
  return Math.round((corridor.length / 8) * 100);
}

export function statusTone(status) {
  if (status === '비상 정지') return 'stopped';
  if (status === '충전 복귀' || status === '충전 중' || status === '경로 재계획') return 'charging';
  if (status === '대기' || status === '승객 대기' || status === '하차 대기') return 'idle';
  return 'moving';
}
