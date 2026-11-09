import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, BatteryCharging, Bot, ChevronLeft, ChevronRight, CircleAlert, Clock3, Cpu, Crosshair,
  Brain, Gauge, Home, LayoutDashboard, MapPin, Navigation, Pause, Play, Radio, Route, ShieldAlert, Signal, Siren, Smartphone, UserRound, Plus,
} from 'lucide-react';
import LearnMode from './components/LearnMode.jsx';
import StationScene from './components/StationScene.jsx';
import FloorPlan from './components/FloorPlan.jsx';
import AndroidConsole from '../android/AndroidConsole.jsx';
import { fetchOrders, sendFleet } from '../android/orderClient.js';
import {
  addRobot, assignMission, congestionScore, createWorld, etaSeconds, findMapPath, formatEta,
  nodeLabel, nodes, returnToCharge, scenarioObstacles, statusTone, tickWorld,
} from './simulation.js';

const timeNow = () => new Date().toLocaleTimeString('ko-KR', { hour12: false });
const FLOOR_NAME = { '1F': '지하 1층', B1: '지하 2층' };
const SPATIAL_FLOORS = ['1F', 'B1'];
const BOARDING_SPOTS = nodes.filter((node) => !node.forbidden && !node.service);
const EMPTY_PASSENGER = { name: '', age: '', severity: '중증', grade: '1급', staff: '' };
const DISABILITY_GRADES = ['1급', '2급', '3급', '4급', '5급', '6급'];

function spotPoint(node) {
  return {
    id: node.id,
    label: node.label,
    x: node.x,
    z: node.z,
    floor: node.floor,
    radius: node.radius || 0.7,
  };
}

function spotTitle(node) {
  return `수서역 ${FLOOR_NAME[node.floor] || node.floor} · ${node.label.replace(/^B[12]\s/, '')}`;
}

function placeLabel(point) {
  if (!point) return '지정 없음';
  const node = nodes.find((item) => item.id === point.id);
  if (node?.label) return spotTitle({ ...node, floor: point.floor || node.floor });
  if (point.label && point.floor) return spotTitle(point);
  return nodeLabel(point.id || point) || '지정 없음';
}

function KorailMark() {
  return (
    <svg className="brandmark" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#0054A6" />
      <text x="24" y="32" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="800" fontFamily="Arial, sans-serif">K</text>
    </svg>
  );
}

function pushEvents(prev, incoming) {
  if (!incoming?.length) return prev;
  const stamped = incoming.map((e) => ({ ...e, time: timeNow(), id: `${Date.now()}-${Math.random()}` }));
  return [...stamped, ...prev].slice(0, 24);
}

export default Dashboard;

function Dashboard() {
  const [world, setWorld] = useState(createWorld);
  const [selected, setSelected] = useState('SW-01');
  const [focusTick, setFocusTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [estop, setEstop] = useState(false);
  const [autoReturn, setAutoReturn] = useState(true);
  const [obstacle, setObstacle] = useState(false);
  const [missionDraft, setMissionDraft] = useState(null);
  const [routeGuide, setRouteGuide] = useState(null);
  const [clock, setClock] = useState(timeNow);
  const [layers, setLayers] = useState({ path: true, lidar: true, crowd: true, geofence: true });
  const [view, setView] = useState('overview');
  const [overviewMode, setOverviewMode] = useState('plan');
  const [spatialFloor, setSpatialFloor] = useState('1F');
  const [eventsOpen, setEventsOpen] = useState(false);
  const [infoRobotId, setInfoRobotId] = useState(null);
  const [infoMapFloor, setInfoMapFloor] = useState('B1');
  const [fleetOpen, setFleetOpen] = useState(true);
  const [telemetryOpen, setTelemetryOpen] = useState(true);
  const [passengerForm, setPassengerForm] = useState(EMPTY_PASSENGER);
  const flagsRef = useRef({ paused, estop, autoReturn, obstacle });
  const robotsRef = useRef(world.robots);
  const applyOrderRef = useRef(() => {});
  const seenOrdersRef = useRef(new Set());
  const homeSeenRef = useRef({});
  const plannerRobotRef = useRef(null);
  flagsRef.current = { paused, estop, autoReturn, obstacle };
  robotsRef.current = world.robots;
  plannerRobotRef.current = missionDraft?.robotId || routeGuide?.robotId || null;

  useEffect(() => {
    const arrived = [];
    for (const robot of world.robots) {
      const seq = robot.homeSeq || 0;
      const prev = homeSeenRef.current[robot.id];
      if (prev === undefined) {
        homeSeenRef.current[robot.id] = seq;
        continue;
      }
      if (prev !== seq) {
        homeSeenRef.current[robot.id] = seq;
        arrived.push(robot.id);
      }
    }
    if (!arrived.includes(plannerRobotRef.current)) return;
    setMissionDraft(null);
    setRouteGuide(null);
    setPassengerForm({ ...EMPTY_PASSENGER });
  }, [world.robots]);

  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.08, (now - last) / 1000);
      last = now;
      setClock(timeNow());
      const flags = flagsRef.current;
      if (flags.paused || flags.estop) {
        if (flags.estop) {
          setWorld((w) => ({
            ...w,
            robots: w.robots.map((r) => ({ ...r, speed: 0, status: '비상 정지' })),
          }));
        }

        return;
      }
      setWorld((w) => tickWorld(w, dt, flags));
    }, 50);
    return () => clearInterval(id);
  }, []);

  const robots = world.robots;
  const active = robots.find((r) => r.id === selected) || robots[0];
  const infoRobot = robots.find((robot) => robot.id === infoRobotId) || null;
  const events = world.eventLog || [];
  const log = (type, text) =>
    setWorld((w) => ({
      ...w,
      eventLog: pushEvents(w.eventLog || [], [{ type, text }]),
    }));
  const online = robots.length;
  const avgBattery = Math.round(robots.reduce((a, r) => a + r.battery, 0) / robots.length);
  const missions = robots.filter((r) => ['이동 중', '충전 복귀', '회피 중', '경로 재계획', '보행자 대기', '엘리베이터 이동'].includes(r.status)).length;
  const congestion = congestionScore(world.pedestrians);
  const avgSpeed = robots.reduce((a, r) => a + (r.speed || 0), 0) / robots.length;
  const planner = missionDraft || (routeGuide && {
    robotId: routeGuide.robotId,
    start: routeGuide.start,
    destination: routeGuide.destination,
    selectionFloor: routeGuide.floor,
    guiding: true,
  });
  const plannedPath = useMemo(() => {
    const start = missionDraft?.start || (!missionDraft ? routeGuide?.start : null);
    const destination = missionDraft?.destination || (!missionDraft ? routeGuide?.destination : null);
    if (!start || !destination) return [];
    const path = findMapPath(start, destination, world.extras);
    return path?.length ? [start, ...path] : [];
  }, [missionDraft, routeGuide, world.extras]);

  const closePlanner = () => {
    setMissionDraft(null);
    setRouteGuide(null);
  };

  const showOverview = () => {
    setView('overview');
    setMissionDraft(null);
    setRouteGuide(null);
    setInfoRobotId(null);
  };

  const showFleet = () => {
    setView('fleet');
    setFocusTick((tick) => tick + 1);
  };

  const focusRobot = (robotId) => {
    setSelected(robotId);
    setInfoRobotId(null);
    setFocusTick((tick) => tick + 1);
  };

  const showRobotInfo = (robotId) => {
    const robot = robotsRef.current.find((item) => item.id === robotId);
    setView('fleet');
    setSelected(robotId);
    setInfoRobotId(robotId);
    setInfoMapFloor(robot?.floor || robot?.targetPoint?.floor || '1F');
    setFocusTick((tick) => tick + 1);
    setMissionDraft(null);
    setRouteGuide(null);
  };

  const startMissionSelection = (robotId = selected) => {
    const robot = robots.find((r) => r.id === robotId) || robots[0];
    setSelected(robot.id);
    setRouteGuide(null);
    setMissionDraft({
      robotId: robot.id,
      start: null,
      destination: null,
      selecting: 'start',
      selectionFloor: robot.floor,
    });
  };

  const trackRobot = (robotId) => {
    focusRobot(robotId);
  };

  const selectDeparture = (nodeId) => {
    const node = BOARDING_SPOTS.find((spot) => spot.id === nodeId);
    const robotId = missionDraft?.robotId || routeGuide?.robotId || selected;
    if (!node) {
      setRouteGuide(null);
      setMissionDraft((draft) => draft && ({
        ...draft,
        robotId,
        start: null,
        destination: null,
        selecting: 'start',
      }));
      return;
    }
    setRouteGuide(null);
    setMissionDraft({
      robotId,
      start: spotPoint(node),
      destination: null,
      selecting: 'destination',
      selectionFloor: node.floor,
    });
  };

  const selectDestination = (nodeId) => {
    const start = missionDraft?.start || routeGuide?.start || null;
    const robotId = missionDraft?.robotId || routeGuide?.robotId || selected;
    if (!start) {
      log('warn', '출발역을 먼저 선택하세요');
      return;
    }
    const node = BOARDING_SPOTS.find((spot) => spot.id === nodeId);
    if (!node) {
      if (missionDraft) {
        setMissionDraft((draft) => draft && ({ ...draft, destination: null, selecting: 'destination' }));
      }
      return;
    }
    if (start.id === node.id) {
      log('warn', '출발역과 다른 도착 스팟을 선택하세요');
      return;
    }
    moveBetween(robotId, start, spotPoint(node));
  };

  const moveBetween = (robotId, start, destination, passengerOverride, options = {}) => {
    const route = findMapPath(start, destination, world.extras);
    if (!route?.length) {
      log('warn', `${start.label}에서 ${destination.label}까지 갈 수 있는 길이 없습니다`);
      return false;
    }
    const source = passengerOverride === undefined ? passengerForm : (passengerOverride || EMPTY_PASSENGER);
    const passenger = {
      name: String(source.name || '').trim(),
      age: String(source.age || '').trim(),
      severity: source.severity === '경증' ? '경증' : '중증',
      grade: source.grade || '1급',
      staff: String(source.staff || '').trim(),
    };
    const boarding = passenger.name || passenger.age || passenger.staff;
    if (boarding && (!passenger.name || !passenger.age || !passenger.staff)) {
      log('warn', '탑승 고객의 이름, 나이, 담당 역무원을 모두 입력하세요');
      return false;
    }
    setWorld((w) => {
      const { world: next, assignedId } = assignMission(w, robotId, start, destination);
      setSelected(assignedId);
      if (!boarding) return next;
      return {
        ...next,
        robots: next.robots.map((robot) => (
          robot.id === assignedId ? { ...robot, passenger, occupied: true } : robot
        )),
      };
    });
    if (!options.remote) {
      setRouteGuide({
        robotId,
        start,
        destination,
        floor: start.floor,
      });
      setMissionDraft(null);
    }
    log('success', `${options.remote ? '원격 오더 · ' : ''}${robotId} 이동 · ${spotTitle(start)} → ${spotTitle(destination)}`);
    return true;
  };

  applyOrderRef.current = (order) => {
    const start = BOARDING_SPOTS.find((spot) => spot.id === order.startId);
    const destination = BOARDING_SPOTS.find((spot) => spot.id === order.destinationId);
    if (!start || !destination) return;
    moveBetween(order.robotId, spotPoint(start), spotPoint(destination), order.passenger, { remote: true });
  };

  useEffect(() => {
    let cursor = 0;
    let primed = false;
    const accept = (order) => {
      if (seenOrdersRef.current.has(order.id)) return;
      seenOrdersRef.current.add(order.id);
      applyOrderRef.current(order);
    };
    const timer = setInterval(async () => {
      try {
        const data = await fetchOrders(cursor);
        if (!primed) {
          primed = true;
          (data.orders || []).filter((order) => Date.now() - order.createdAt < 20000).forEach(accept);
          cursor = data.cursor ?? cursor;
          return;
        }
        cursor = data.cursor ?? cursor;
        (data.orders || []).forEach(accept);
      } catch {
        // 다음 주기에 다시 조회한다.
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const publish = () => sendFleet(robotsRef.current).catch(() => {});
    publish();
    const timer = setInterval(publish, 2000);
    return () => clearInterval(timer);
  }, []);

  const selectSpot = (node) => {
    const point = spotPoint(node);
    const robotId = missionDraft?.robotId || routeGuide?.robotId || selected;
    const currentStart = missionDraft?.start || routeGuide?.start || null;
    if (!currentStart || missionDraft?.selecting === 'start') {
      setRouteGuide(null);
      setMissionDraft({
        robotId,
        start: point,
        destination: null,
        selecting: 'destination',
        selectionFloor: node.floor,
      });
      return;
    }
    if (currentStart.id === point.id) {
      log('warn', '출발역과 다른 도착 스팟을 선택하세요');
      return;
    }
    moveBetween(robotId, currentStart, point);
  };

  const selectMissionFloor = (floor) => {
    if (missionDraft) {
      setMissionDraft((draft) => draft && ({ ...draft, selectionFloor: floor }));
      return;
    }
    setRouteGuide((guide) => guide && ({ ...guide, floor }));
  };

  const addFleetRobot = () => {
    setWorld((current) => {
      const { world: next, addedId } = addRobot(current);
      if (addedId) {
        setSelected(addedId);
      }
      return next;
    });
  };

  const injectObstacle = () => {
    setObstacle((v) => {
      const next = !v;
      setWorld((w) => ({ ...w, extras: next ? scenarioObstacles() : [] }));
      log('warn', next ? '복도 장애물·혼잡 시나리오 투입 · 로컬 회피 시작' : '장애물 시나리오 해제 · 기본 보행 흐름 복귀');
      return next;
    });
  };

  const triggerEStop = () => {
    const next = !estop;
    setEstop(next);
    if (!next) {
      setWorld((w) => ({
        ...w,
        robots: w.robots.map((r) => ({
          ...r,
          status: r.returnPrompt ? '하차 대기' : r.target === 'charge' && r.missionPath?.length ? '충전 복귀' : r.status === '충전 중' ? '충전 중' : (r.missionPath?.length || r.route?.length > 1) ? '이동 중' : '대기',
        })),
      }));
    }
    log(next ? 'danger' : 'success', next ? '비상 정지(E-STOP) · 시뮬레이터 전체 구동 정지' : '비상 정지 해제 · 시뮬 재개');
  };

  const passengerCall = () => {
    setWorld((w) => ({ ...w, requestCount: w.requestCount + 1 }));
    log('info', '신규 승객 호출 · 안드로이드 화면에서 출발지와 도착지를 지정합니다');
  };

  const onReturnCharge = (robotId = selected, source = '수동') => {
    setWorld((w) => returnToCharge(w, robotId, source).world);
  };

  const resetSim = () => {
    setWorld(createWorld());
    setEstop(false);
    setPaused(false);
    setObstacle(false);
    setSelected('SW-01');
    setMissionDraft(null);
    setRouteGuide(null);
    log('info', '가상 역사 시뮬레이션 초기화');
  };

  const toggleLayer = (key) => setLayers((l) => ({ ...l, [key]: !l[key] }));
  const slam = estop ? 0 : Math.max(86, 99.4 - (active.avoiding ? 4.2 : 0) - (active.nearestDist < 1 ? 3 : 0));
  const lidarLabel = active.nearestDist < 8 ? `${active.nearestDist.toFixed(1)}m` : '—';
  const missionStartLabel = planner?.start ? spotTitle(planner.start) : '출발역을 선택하세요';
  const missionDestinationLabel = planner?.destination ? spotTitle(planner.destination) : '도착 스팟을 누르세요';
  const plannerFloor = planner?.selectionFloor || '1F';

  return (
    <main className={`app view-${view}`}>
      <nav className="sidenav" aria-label="주 메뉴">
        <button className={view === 'overview' ? 'active' : ''} onClick={showOverview}>
          <LayoutDashboard size={20} />
          <span>전체 관제</span>
        </button>
        <button className={view === 'fleet' ? 'active' : ''} onClick={showFleet}>
          <Bot size={20} />
          <span>로봇 운행</span>
        </button>
        <button className={view === 'android' ? 'active' : ''} onClick={() => setView('android')}>
          <Smartphone size={20} />
          <span>안드로이드</span>
        </button>
        <button className={view === 'learn' ? 'active' : ''} onClick={() => setView('learn')}>
          <Brain size={20} />
          <span>강화학습</span>
        </button>
        <button
          className={`nav-alarm ${eventsOpen ? 'open' : ''}`}
          onClick={() => setEventsOpen((open) => !open)}
          aria-expanded={eventsOpen}
          aria-label="실시간 알람"
        >
          <span className="alarm-mark">!</span>
          <span>알람</span>
          {events.length > 0 && <b>{Math.min(events.length, 9)}</b>}
        </button>
      </nav>
      {view === 'android' && <AndroidConsole />}
      {view === 'learn' && <LearnMode />}
      <div className="scene">
        <StationScene
          robots={robots}
          pedestrians={world.pedestrians}
          extras={world.extras}
          selected={selected}
          onSelect={trackRobot}
          focusTick={focusTick}
          cameraMode={view === 'fleet' ? 'follow' : overviewMode}
          spatialFloor={spatialFloor}
          missionDraft={view === 'fleet' ? missionDraft : null}
          selectionFloor={missionDraft?.selectionFloor}
          plannedPath={plannedPath}
          layers={layers}
        />
      </div>

      <header className="topbar glass">
        <div className="brand">
          <KorailMark />
          <div>
            <div className="korail-word">KORAIL</div>
            <div className="brandname">수서역 <span>휠체어 관제</span></div>
          </div>
        </div>
        <div className="live">
          <span className="pulse" /> LIVE SIMULATION <span className="separator">/</span> {clock}
        </div>
        <div className="topright">
          <span className="connection"><Signal size={17} /> 시뮬 링크 · 실하드웨어 없음</span>
          <span className="view-caption">{view === 'overview' ? '전체 3D 관제' : view === 'learn' ? '강화학습 모드' : view === 'android' ? '안드로이드 오더' : '로봇 운행 제어'}</span>
          <div className="operator">
            <div className="avatar">관</div>
            <div><b>통합 관제센터</b><small>DEMO OPERATOR</small></div>
          </div>
        </div>
      </header>

      {view === 'overview' && <section className="kpis">
        <div className="kpi glass">
          <div className="kpi-icon teal"><Bot size={20} /></div>
          <div>
            <small>운영 로봇</small>
            <strong>{online}<em> 대</em></strong>
            <span className="positive">● 시뮬 에이전트 온라인</span>
          </div>
        </div>
        <div className="kpi glass">
          <div className="kpi-icon blue"><Activity size={20} /></div>
          <div>
            <small>평균 배터리</small>
            <strong>{avgBattery}<em>%</em></strong>
            <div className="mini-bar"><i style={{ width: `${avgBattery}%` }} /></div>
          </div>
        </div>
        <div className="kpi glass">
          <div className="kpi-icon violet"><Route size={20} /></div>
          <div>
            <small>운행 · 회피</small>
            <strong>{missions}<em> 대</em></strong>
            <span className="muted">평균 {avgSpeed.toFixed(2)} m/s</span>
          </div>
        </div>
        <div className="kpi glass">
          <div className="kpi-icon amber"><UserRound size={20} /></div>
          <div>
            <small>보행자 · 호출</small>
            <strong>{world.pedestrians.length}<em> / {world.requestCount}</em></strong>
            <span className={congestion > 70 ? 'warntext' : 'positive'}>복도 혼잡 {congestion}%</span>
          </div>
        </div>
      </section>}

      {view === 'overview' && <div className="maplabel">
        <span className="mapdot" />
        <div>
          <b>KORAIL 수서역</b>
          <small>{overviewMode === 'plan' ? '지하 1층 · 지하 2층 평면도' : `${FLOOR_NAME[spatialFloor]} 수직 3D`}</small>
        </div>
        <span className="maptag">DIGITAL TWIN SIM</span>
      </div>}

      {view === 'overview' && (
        <div className="view-switch" role="group" aria-label="관제 시점">
          <button className={overviewMode === 'plan' ? 'active' : ''} aria-pressed={overviewMode === 'plan'} onClick={() => setOverviewMode('plan')}>평면도</button>
          <button className={overviewMode === 'spatial' ? 'active' : ''} aria-pressed={overviewMode === 'spatial'} onClick={() => setOverviewMode('spatial')}>수직 3D</button>
        </div>
      )}

      {view === 'overview' && overviewMode === 'spatial' && (
        <div className="floor-slider">
          <button
            type="button"
            className="floor-nudge prev"
            aria-label="이전 층"
            disabled={spatialFloor === '1F'}
            onClick={() => setSpatialFloor(SPATIAL_FLOORS[SPATIAL_FLOORS.indexOf(spatialFloor) - 1])}
          >
            <ChevronLeft size={28} />
          </button>
          <div className="floor-slide-name">{FLOOR_NAME[spatialFloor]}</div>
          <button
            type="button"
            className="floor-nudge next"
            aria-label="다음 층"
            disabled={spatialFloor === 'B1'}
            onClick={() => setSpatialFloor(SPATIAL_FLOORS[SPATIAL_FLOORS.indexOf(spatialFloor) + 1])}
          >
            <ChevronRight size={28} />
          </button>
      </div>
      )}

      {view === 'fleet' && (
      <div className={`fleet-drawer left ${fleetOpen ? 'open' : ''}`}>
      <aside className="leftpanel glass" aria-hidden={!fleetOpen}>
        <div className="panelhead">
          <div>
            <span className="eyebrow">FLEET MANAGEMENT</span>
            <h2>로봇 플릿 <span className="count">{String(robots.length).padStart(2, '0')}</span></h2>
          </div>
        </div>
        <div className="robotlist">
          {robots.map((r) => (
            <div key={r.id} className={`robotrow ${selected === r.id ? 'selected' : ''}`}>
              <button type="button" className="robot-track" onClick={() => focusRobot(r.id)} aria-label={`${r.id} 화면 중앙으로`}>
              <div className="robot-icon" style={{ '--robot': r.color }}><Bot size={21} /><span /></div>
              <div className="robot-info">
                <b>{r.id}<span className={`status ${statusTone(r.status)}`}>{r.status}</span></b>
                <small>{r.targetPoint ? `${r.targetPoint.floor} 맵 지정 지점` : nodeLabel(r.target)}</small>
                <div className="batteryline">
                  <div className="battery"><i style={{ width: `${r.battery}%`, background: r.battery < 25 ? '#ffbd69' : r.color }} /></div>
                  <small>{Math.round(r.battery)}%</small>
                </div>
              </div>
              </button>
              <button type="button" className="robot-edit" onClick={() => showRobotInfo(r.id)} aria-label={`${r.id} 운행 정보`}>
                <ChevronRight size={18} />
            </button>
            </div>
          ))}
        </div>
        <button className="actionrow add-robot" onClick={addFleetRobot}>
          <span className="actionicon cyan"><Plus size={18} /></span>
          <span><b>휠체어 추가</b><small>플릿에 새 로봇을 배치합니다</small></span>
          <span className="plus">+</span>
        </button>
        <div className="paneldivider" />
        <div className="sectiontitle"><span>SCENARIO CONTROLS</span><span className="demo-pill">VIRTUAL DEMO</span></div>
        <button className={`actionrow ${obstacle ? 'active' : ''}`} onClick={injectObstacle}>
          <span className="actionicon orange"><CircleAlert size={18} /></span>
          <span>
            <b>{obstacle ? '혼잡·장애물 해제' : '혼잡·장애물 주입'}</b>
            <small>수하물 3개를 지하 1층 · 지하 2층에 분산 배치</small>
          </span>
          <span className={`toggle ${obstacle ? 'on' : ''}`} />
        </button>
        <button className={`actionrow ${estop ? 'dangerrow' : ''}`} onClick={triggerEStop}>
          <span className="actionicon red"><Siren size={18} /></span>
          <span>
            <b>{estop ? '비상 정지 해제' : '비상 정지 (E-STOP)'}</b>
            <small>{estop ? '시뮬 전체 정지' : '모든 휠체어 즉시 정지'}</small>
          </span>
          <span className={`toggle ${estop ? 'on redtoggle' : ''}`} />
        </button>
        <button className="actionrow" onClick={() => onReturnCharge(selected, '비상')}>
          <span className="actionicon orange"><Home size={18} /></span>
          <span>
            <b>비상 원위치</b>
            <small>{selected} 역무원이 충전존으로 되돌립니다</small>
          </span>
        </button>
        <button className="actionrow" onClick={passengerCall}>
          <span className="actionicon cyan"><UserRound size={18} /></span>
          <span><b>신규 승객 호출</b><small>가상 키오스크 요청 생성</small></span>
          <span className="plus">+</span>
        </button>
        <div className="paneldivider" />
        <div className="switchrow">
          <span><b>자동 충전 복귀</b><small>공차 · 배터리 20% 미만</small></span>
          <button className={`toggle ${autoReturn ? 'on' : ''}`} onClick={() => setAutoReturn((v) => !v)} />
        </div>
      </aside>
      <button
        type="button"
        className="panel-dock"
        aria-expanded={fleetOpen}
        aria-label={fleetOpen ? '로봇 플릿 접기' : '로봇 플릿 펼치기'}
        onClick={() => setFleetOpen((open) => !open)}
      >
        {fleetOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        <span>플릿</span>
      </button>
      </div>
      )}

      {view === 'fleet' && (
      <div className={`fleet-drawer right ${telemetryOpen ? 'open' : ''}`}>
      <aside className="rightpanel glass" aria-hidden={!telemetryOpen}>
        <div className="panelhead">
          <div>
            <span className="eyebrow">LIVE TELEMETRY</span>
            <h2>{active.id} <span className="livebadge"><i /> SIM</span></h2>
          </div>
          <span className="robot-tag">{active.status}</span>
        </div>
        <div className="batteryhero">
          <div className="battery-ring" style={{ '--pct': `${active.battery * 3.6}deg` }}>
            <BatteryCharging size={25} />
            <b>{Math.round(active.battery)}<small>%</small></b>
          </div>
          <div>
            <span className="eyebrow">BATTERY LEVEL</span>
            <h3>{active.battery < 20 ? '충전 필요' : active.battery < 45 ? '충전 권장' : '정상 작동'}</h3>
            <small>시뮬 잔여 운행 {Math.round(active.battery * 0.42)}분</small>
          </div>
        </div>
        <div className="telemetrygrid">
          <div>
            <small><Gauge size={14} /> 주행 속도</small>
            <b>{estop ? '0.00' : active.speed.toFixed(2)} <em>m/s</em></b>
          </div>
          <div>
            <small><Crosshair size={14} /> 위치 추정</small>
            <b className="green">{estop ? 'HOLD' : '시뮬'} <em>{slam.toFixed(1)}%</em></b>
          </div>
          <div>
            <small><Cpu size={14} /> 회피 상태</small>
            <b>{active.avoiding ? '회피 조향' : '추종'} <em>{active.avoiding ? 'LOCAL' : 'PATH'}</em></b>
          </div>
          <div>
            <small><Radio size={14} /> 최근접 장애물</small>
            <b>{active.nearestDist < 1.2 ? '근접' : '주변 여유'} <em>{lidarLabel}</em></b>
          </div>
        </div>
        <div className="routebox">
          <div className="routehead">
            <b><Route size={15} /> 할당 경로</b>
            <span>{active.missionPath?.length || active.route?.length || 1} WAYPOINTS · A*</span>
          </div>
          {active.missionPath?.length ? (
            <div className="direct-route">
              <span>{active.originPoint?.floor || active.floor} 출발</span>
              <i />
              <span>장애물 인지 최단경로</span>
              <i />
              <span>{active.targetPoint?.floor || active.floor} 도착</span>
            </div>
          ) : (
            <div className="routepath">
              {(active.route || []).map((id, i) => (
                <React.Fragment key={id + i}>
                  <span className={i <= (active.routeIndex || 0) ? 'passed' : ''}>{nodeLabel(id)}</span>
                  {i < active.route.length - 1 && <i />}
                </React.Fragment>
              ))}
            </div>
          )}
          <div className="routefoot">
            <span><MapPin size={13} /> {active.targetPoint ? `${active.targetPoint.floor} 맵 지점` : nodeLabel(active.target)}</span>
            <span><Clock3 size={13} /> ETA {formatEta(etaSeconds(active))}</span>
          </div>
        </div>
        <div className="diagnostics">
          <div className="sectiontitle">
            <span>SIM DIAGNOSTICS</span>
            <span className="normaltext">● {active.status === '보행자 대기' ? 'HOLD FOR PEDESTRIAN' : active.avoiding ? 'AVOIDING' : 'NOMINAL'}</span>
          </div>
          <div className="diagline"><span className="diagcheck">✓</span><span>혼잡 비용 A* 전역 경로</span><b>{world.metrics.replans} 재계획</b></div>
          <div className="diagline"><span className="diagcheck">✓</span><span>보행자·로봇 로컬 포텐셜 회피</span><b>{world.metrics.nearMisses} 근접</b></div>
          <div className="diagline">
            <span className={`diagcheck ${obstacle || active.nearestDist < 1.1 ? 'warncheck' : ''}`}>{obstacle || active.nearestDist < 1.1 ? '!' : '✓'}</span>
            <span>{obstacle ? '시나리오 장애물 활성' : '동적 장애물 감시'}</span>
            <b>{obstacle ? 'CROWD' : 'READY'}</b>
          </div>
        </div>
        <div className="robotactions">
          <button className="secondarybtn" onClick={onReturnCharge}><BatteryCharging size={15} /> 충전 복귀</button>
        </div>
      </aside>
      <button
        type="button"
        className="panel-dock"
        aria-expanded={telemetryOpen}
        aria-label={telemetryOpen ? '운행 정보 접기' : '운행 정보 펼치기'}
        onClick={() => setTelemetryOpen((open) => !open)}
      >
        {telemetryOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        <span>상태</span>
      </button>
      </div>
      )}

      <aside className={`event-drawer glass ${eventsOpen ? 'open' : ''}`} aria-hidden={!eventsOpen}>
        <div className="bottomtitle">
          <span><Activity size={15} /> 실시간 알람</span>
          <button className="drawer-close" onClick={() => setEventsOpen(false)}>닫기</button>
        </div>
        <div className="eventlist">
          {events.length === 0 && <p className="event-empty">새 알람이 없습니다.</p>}
          {events.map((e) => (
            <div className="event" key={e.id}>
              <span className={`eventdot ${e.type}`} />
              <small>{e.time}</small>
              <span>{e.text}</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="bottomright glass">
        <div className="minihead"><span>MAP LAYERS</span><span className="layerlive">● SIM</span></div>
        {[
          ['path', 'layerpath', '글로벌 경로'],
          ['lidar', 'layerlidar', 'LiDAR 스캔'],
          ['crowd', 'layercrowd', '보행자 흐름'],
          ['geofence', 'layergeo', '금지 구역'],
        ].map(([key, cls, label]) => (
          <button key={key} className={`layerrow ${layers[key] ? '' : 'off'}`} onClick={() => toggleLayer(key)}>
            <i className={cls} /> {label} <span>{layers[key] ? 'ON' : 'OFF'}</span>
          </button>
        ))}
        <div className="mapcoords">도착 {world.metrics.arrivals} · 근접회피 {world.metrics.nearMisses}</div>
      </div>

      <footer className="footer">
        <span>KORAIL · 수서역 모빌리티</span>
        <span><i /> SIMULATION MODE · HARDWARE NOT CONNECTED</span>
        <div className="playcontrols">
          <button onClick={() => setPaused((v) => !v)}>{paused ? <Play size={14} /> : <Pause size={14} />} {paused ? '재개' : '일시정지'}</button>
          <button className="home-recall" onClick={() => onReturnCharge(selected, '비상')}><Home size={14} /> 비상 원위치</button>
          <button onClick={resetSim}>초기화</button>
        </div>
      </footer>

      {view === 'fleet' && infoRobot && (
        <>
          <button className="planner-scrim" aria-label="운행 정보 닫기" onClick={() => setInfoRobotId(null)} />
          <section className="missionbar glass route-planner robot-brief" aria-label={`${infoRobot.id} 운행 정보`}>
            <div className="missionbar-head">
              <div className="planner-brand">
                <KorailMark />
                <div>
                  <b>{infoRobot.id} 운행 정보</b>
                  <small>{infoRobot.status}</small>
                </div>
              </div>
              <button className="mission-cancel" onClick={() => setInfoRobotId(null)} aria-label="운행 정보 닫기">×</button>
            </div>
            <div className="robot-brief-grid">
              <p><em>출발지</em><b>{placeLabel(infoRobot.originPoint)}</b></p>
              <p><em>도착지</em><b>{placeLabel(infoRobot.targetPoint)}</b></p>
              <p><em>고객명</em><b>{[infoRobot.passenger?.name, infoRobot.passenger?.age ? `${infoRobot.passenger.age}세` : ''].filter(Boolean).join(' / ') || '없음'}</b></p>
              <p><em>고객정보</em><b>{[infoRobot.passenger?.severity, infoRobot.passenger?.grade].filter(Boolean).join(' ') || '없음'}</b></p>
              <p className="span"><em>역무원</em><b>{infoRobot.passenger?.staff || '없음'}</b></p>
            </div>
            <div className="robot-brief-map">
              <div className="mission-map-edit">
                <div className="mission-map-floors" aria-label="평면도 층">
                  {SPATIAL_FLOORS.map((floor) => (
                    <button
                      key={floor}
                      type="button"
                      className={infoMapFloor === floor ? 'active' : ''}
                      onClick={() => setInfoMapFloor(floor)}
                      aria-pressed={infoMapFloor === floor}
                    >
                      {FLOOR_NAME[floor]}
                    </button>
                  ))}
                </div>
              </div>
              <FloorPlan
                floor={infoMapFloor}
                spots={BOARDING_SPOTS}
                start={infoRobot.originPoint}
                destination={infoRobot.targetPoint}
                path={infoRobot.missionPath || []}
                robots={robots}
                extras={world.extras}
              />
            </div>
            <div className="planner-legend">
              <span><i className="ahead" /> 지나갈 길</span>
              <span><i className="done" /> 지나온 길</span>
              <span>출 출발역</span>
              <span>도 도착 스팟</span>
            </div>
          </section>
        </>
      )}

      {view !== 'android' && robots.some((robot) => robot.returnPrompt) && (
        <div className="recall-center">
          {robots.filter((robot) => robot.returnPrompt).map((robot) => (
            <section className="recall-card glass" key={robot.id}>
              <span>역무원 확인</span>
              <b>{robot.id} 하차 완료</b>
              <small>{robot.passenger?.name ? `${robot.passenger.name} 손님 · ` : ''}{nodeLabel(robot.target)} 도착</small>
              <strong>{Math.max(0, Math.ceil(robot.returnHold))}</strong>
              <em>초 후 충전존 자동 복귀</em>
              <button type="button" onClick={() => onReturnCharge(robot.id, '수동')}>충전존으로 복귀</button>
            </section>
          ))}
          </div>
      )}

      {estop && (
        <div className="estopbanner">
          <ShieldAlert size={18} /> EMERGENCY STOP ACTIVE <span>시뮬레이터 전체 로봇 정지</span>
        </div>
      )}
    </main>
  );
}
