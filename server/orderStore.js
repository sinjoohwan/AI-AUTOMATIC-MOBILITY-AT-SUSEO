import { nodes } from '../src/simulation.js';

const SPOTS = new Map(nodes.filter((node) => !node.forbidden && !node.service).map((node) => [node.id, node]));
const memory = globalThis.__suseoOrderMemory || (globalThis.__suseoOrderMemory = {
  seq: 0,
  orders: [],
  fleet: { robots: [], updatedAt: 0 },
});

function redisEnv() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

async function redisCommand(args) {
  const env = redisEnv();
  if (!env) return null;
  const response = await fetch(env.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!response.ok) throw new Error(`주문 저장소 응답 ${response.status}`);
  const payload = await response.json();
  return payload.result;
}

function storageName() {
  return redisEnv() ? 'redis' : 'memory';
}

function normalizePassenger(input) {
  if (!input) return null;
  const passenger = {
    name: String(input.name || '').trim(),
    age: String(input.age || '').trim(),
    severity: input.severity === '경증' ? '경증' : '중증',
    grade: ['1급', '2급', '3급', '4급', '5급', '6급'].includes(input.grade) ? input.grade : '1급',
    staff: String(input.staff || '').trim(),
  };
  const filled = passenger.name || passenger.age || passenger.staff;
  if (!filled) return null;
  if (!passenger.name || !passenger.age || !passenger.staff) {
    return { error: '탑승 고객의 이름, 나이, 담당 역무원을 모두 입력하세요' };
  }
  return passenger;
}

export async function createOrder(input = {}) {
  const start = SPOTS.get(input.startId);
  const destination = SPOTS.get(input.destinationId);
  const robotId = String(input.robotId || '').trim();
  if (!robotId) return { ok: false, error: '운행할 로봇을 선택하세요' };
  if (!start || !destination) return { ok: false, error: '출발지와 도착지를 선택하세요' };
  if (start.id === destination.id) return { ok: false, error: '출발지와 다른 도착지를 선택하세요' };
  const passenger = normalizePassenger(input.passenger);
  if (passenger?.error) return { ok: false, error: passenger.error };

  const order = {
    id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    robotId,
    startId: start.id,
    destinationId: destination.id,
    passenger: passenger?.error ? null : passenger,
    createdAt: Date.now(),
  };

  if (redisEnv()) {
    order.seq = Number(await redisCommand(['INCR', 'suseo:seq']));
    await redisCommand(['RPUSH', 'suseo:orders', JSON.stringify(order)]);
    await redisCommand(['LTRIM', 'suseo:orders', '-40', '-1']);
    return { ok: true, order, storage: 'redis' };
  }

  memory.seq += 1;
  order.seq = memory.seq;
  memory.orders = [...memory.orders, order].slice(-40);
  return { ok: true, order, storage: 'memory' };
}

export async function listOrders(after = 0) {
  const cursor = Number(after) || 0;
  if (redisEnv()) {
    const raw = await redisCommand(['LRANGE', 'suseo:orders', '0', '-1']);
    const orders = (raw || [])
      .map((item) => JSON.parse(item))
      .filter((order) => order.seq > cursor);
    const next = orders.reduce((max, order) => Math.max(max, order.seq), cursor);
    return { ok: true, orders, cursor: next, storage: 'redis' };
  }
  const orders = memory.orders.filter((order) => order.seq > cursor);
  const next = orders.reduce((max, order) => Math.max(max, order.seq), cursor);
  return { ok: true, orders, cursor: next, storage: 'memory' };
}

export async function publishFleet(robots = []) {
  const fleet = {
    robots: (robots || []).map((robot) => ({
      id: robot.id,
      status: robot.status,
      battery: Math.round(robot.battery || 0),
      floor: robot.floor,
      homeSeq: robot.homeSeq || 0,
    })),
    updatedAt: Date.now(),
  };
  if (redisEnv()) {
    await redisCommand(['SET', 'suseo:fleet', JSON.stringify(fleet)]);
    return { ok: true, storage: 'redis' };
  }
  memory.fleet = fleet;
  return { ok: true, storage: 'memory' };
}

export async function readFleet() {
  if (redisEnv()) {
    const raw = await redisCommand(['GET', 'suseo:fleet']);
    const fleet = raw ? JSON.parse(raw) : { robots: [], updatedAt: 0 };
    return { ok: true, ...fleet, storage: 'redis' };
  }
  return { ok: true, ...memory.fleet, storage: storageName() };
}

export function storageMode() {
  return storageName();
}
