import { assignMission, createWorld, nodes, scenarioObstacles, tickWorld } from './simulation.js';

export const TARGET_SCORE = 30;
export const ROBOT_IDS = ['SW-01', 'SW-02', 'SW-03'];
const MAX_EPISODES = 24;
const TRIP_LIMIT = 180;
const STEP = 0.1;

const SPOTS = nodes.filter((node) => !node.forbidden && !node.service);

export const SCENARIOS = [
  { robotId: 'SW-01', startId: 'hall', destinationId: 'p1a', label: '지하1층 대합실 → 1A 승강장' },
  { robotId: 'SW-02', startId: 'b2_info', destinationId: 'p4a', label: '안내창구B2 → 4A 승강장' },
  { robotId: 'SW-03', startId: 'p6b', destinationId: 'charge', label: '6B 승강장 → 충전 부스' },
  { robotId: 'SW-01', startId: 'taxi', destinationId: 'b2_subway', label: '택시승강장 → 지하철 하차' },
  { robotId: 'SW-02', startId: 'hall', destinationId: 'p6b', label: '대합실 → 6B 승강장' },
];

export function scoreArrival(seconds, arrived) {
  if (!arrived || seconds > TRIP_LIMIT) return -10;
  if (seconds <= 60) return 10;
  if (seconds <= 120) return 5;
  return 0;
}

function spotById(id) {
  return SPOTS.find((spot) => spot.id === id) || nodes.find((node) => node.id === id);
}

export function lessonFor(result) {
  if (result.arrived && result.seconds <= 60) return '경로와 엘리베이터 탑승이 제시간 안에 끝났습니다.';
  if (result.arrived && result.seconds <= 120) return '도착은 했으나 1분을 넘겼습니다. 문 앞 양보가 길었습니다.';
  if (result.arrived) return '3분 안쪽 도착입니다. 우회가 반복되었습니다.';
  if (result.reason === 'no-path') return '출발지와 목적지를 잇는 경로가 없습니다.';
  return '3분 안에 도착하지 못했습니다. 엘리베이터 문 또는 보행자 대기에서 멈췄습니다.';
}

function pairAt(index) {
  const robotId = ROBOT_IDS[index % ROBOT_IDS.length];
  const start = SPOTS[index % SPOTS.length];
  let destination = SPOTS[(index * 5 + 7) % SPOTS.length];
  if (destination.id === start.id) destination = SPOTS[(index + 4) % SPOTS.length];
  return { robotId, start, destination, label: `${start.label} → ${destination.label}` };
}

function simulateEpisode({ robotId, start, destination, obstacle = false }) {
  let world = createWorld();
  world = {
    ...world,
    extras: obstacle ? scenarioObstacles() : [],
    robots: world.robots.map((robot) => ({
      ...robot,
      x: robot.id === robotId ? start.x : robot.x,
      z: robot.id === robotId ? start.z : robot.z,
      floor: robot.id === robotId ? start.floor : robot.floor,
      battery: 90,
      status: '대기',
      occupied: robot.id === robotId,
      passenger: robot.id === robotId ? { name: '학습', age: '40', severity: '중증', grade: '1급', staff: '훈련' } : null,
      returnPrompt: false,
      returnHold: 0,
      target: robot.id === robotId ? destination.id : robot.target,
      missionPath: null,
      elevator: null,
      speed: 0,
    })),
  };
  const assigned = assignMission(
    world,
    robotId,
    { ...start, radius: start.radius || 0.7 },
    { ...destination, radius: destination.radius || 0.7 },
  );
  world = assigned.world;
  const flags = { estop: false, autoReturn: false, obstacle, paused: false };
  const mover = world.robots.find((robot) => robot.id === robotId);
  if (!mover?.missionPath?.length) {
    return { robotId, label: `${start.label} → ${destination.label}`, seconds: TRIP_LIMIT, arrived: false, points: -10, reason: 'no-path', floor: start.floor };
  }
  let elapsed = 0;
  let arrived = false;
  let last = { x: mover.x, z: mover.z, floor: mover.floor };
  let frozen = 0;
  for (; elapsed < TRIP_LIMIT; elapsed += STEP) {
    world = tickWorld(world, STEP, flags);
    const robot = world.robots.find((item) => item.id === robotId);
    const reached = robot.returnPrompt || robot.status === '하차 대기' || robot.status === '충전 중';
    if (reached) {
      arrived = true;
      elapsed += STEP;
      break;
    }
    const shifted = robot.floor !== last.floor || Math.hypot(robot.x - last.x, robot.z - last.z) > 0.04;
    frozen = shifted || robot.status === '엘리베이터 이동' ? 0 : frozen + STEP;
    last = { x: robot.x, z: robot.z, floor: robot.floor };
    if (frozen > 25 && robot.status !== '충전 중') break;
  }
  const robot = world.robots.find((item) => item.id === robotId);
  return {
    robotId,
    label: `${start.label} → ${destination.label}`,
    seconds: Math.round(elapsed * 10) / 10,
    arrived,
    points: scoreArrival(elapsed, arrived),
    reason: arrived ? 'arrive' : frozen > 25 ? 'stuck' : 'timeout',
    floor: robot?.floor,
    status: robot?.status,
  };
}

export function createTrainer() {
  let score = 0;
  let index = 0;
  const episodes = [];
  return {
    get score() { return score; },
    get episodes() { return episodes; },
    get finished() { return score >= TARGET_SCORE; },
    step() {
      if (score >= TARGET_SCORE || index >= MAX_EPISODES) return null;
      const result = { ...simulateEpisode(pairAt(index)), index };
      index += 1;
      score += result.points;
      const row = { ...result, total: score, lesson: lessonFor(result) };
      episodes.push(row);
      return row;
    },
  };
}

export function runScenarios() {
  return SCENARIOS.map((scenario) => {
    const start = spotById(scenario.startId);
    const destination = spotById(scenario.destinationId);
    const result = simulateEpisode({ ...scenario, start, destination, obstacle: true });
    return { ...result, label: scenario.label, lesson: lessonFor(result) };
  });
}

export function improvementProposals(episodes, scenarios) {
  const rows = [...(episodes || []), ...(scenarios || [])];
  const stuck = rows.filter((row) => row.reason === 'stuck');
  const missed = rows.filter((row) => !row.arrived);
  const slow = (scenarios || []).filter((row) => row.arrived && row.seconds > 60);
  const nameOf = (list) => list.slice(0, 3).map((row) => row.label).join(', ');
  const proposals = [
    {
      id: 'deck',
      title: '벽 밖 경로를 실내 바닥 안으로 제한',
      detail: stuck.length || missed.length
        ? `${nameOf(stuck.length ? stuck : missed)} 구간에서 멈추거나 도착하지 못했습니다. 엘리베이터에서 내린 점이 벽과 겹치면 그 점을 건너뛰고, 휠체어 몸체가 들어가는 칸만 길로 씁니다.`
        : '엘리베이터에서 내린 점이 벽과 겹치면 그 점을 건너뛰고, 휠체어 몸체가 들어가는 칸만 길로 씁니다.',
    },
    {
      id: 'replan',
      title: '잠깐 느려져도 경로를 처음부터 다시 잡지 않기',
      detail: slow.length
        ? `${slow.map((row) => `${row.label} ${row.seconds}초`).join(', ')} 가 1분을 넘겼습니다. 회피로 속도가 떨어져도 4초 이상 완전히 멈출 때만 길을 다시 찾습니다.`
        : '회피로 속도가 잠깐 떨어져도 진행 중인 길을 유지하고, 4초 이상 완전히 멈출 때만 다시 찾습니다.',
    },
  ];
  if (missed.length) {
    proposals.push({
      id: 'rescue',
      title: '벽에 끼면 가장 가까운 복도로 빼기',
      detail: `${nameOf(missed)} 가 도착하지 못했습니다. 문·기둥·벽 사이에 끼면 가까운 빈 칸으로 옮긴 뒤 남은 길을 이어 갑니다.`,
    });
  }
  proposals.push({
    id: 'keep',
    title: '도착한 구간의 운행 규칙은 유지',
    detail: missed.length
      ? '이미 도착한 구간의 규칙은 그대로 두고, 위에서 고른 제안만 못 간 구간에 적용합니다.'
      : '이번 시나리오는 3분 안에 도착했습니다. 지금 운행 규칙을 다음 학습에도 유지합니다.',
  });
  return proposals;
}

export function deriveImprovements(episodes, scenarios) {
  const notes = [];
  const stuck = [...episodes, ...scenarios].filter((row) => row.reason === 'stuck');
  const missed = [...episodes, ...scenarios].filter((row) => !row.arrived);
  const slow = scenarios.filter((row) => row.arrived && row.seconds > 60);
  if (!stuck.length) {
    notes.push('엘리베이터 탑승 지점을 현재 층 문 앞으로 맞춰, 다른 층 좌표를 향해 벽에 박히던 이동을 없앴습니다.');
    notes.push('회피만 반복해 목적지가 가까워지지 않으면 2초 뒤 목표 방향으로 다시 주행합니다.');
  } else {
    notes.push(`${stuck.map((row) => row.label).join(', ')} 에서 25초 넘게 제자리였습니다. 문 앞 간격과 우회를 더 넓혀야 합니다.`);
  }
  if (slow.length) {
    notes.push(`${slow.map((row) => `${row.label} ${row.seconds}초`).join(', ')} 는 1분을 넘겼습니다. 혼잡 양보를 짧게 유지합니다.`);
  }
  if (!missed.length) {
    notes.push('시나리오 5건이 모두 3분 안에 도착했습니다. 학습으로 얻은 운행 규칙을 현재 코드에 유지합니다.');
  }
  return notes;
}
