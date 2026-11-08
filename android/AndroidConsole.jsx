import React, { useEffect, useRef, useState } from 'react';
import { nodes } from '../src/simulation.js';
import { fetchFleet, sendOrder } from './orderClient.js';
import './android.css';

const FLOOR_NAME = { '1F': '지하 1층', B1: '지하 2층' };
const batteryDrained = (robot) => Number(robot.battery) < 10;
const SPOTS = nodes.filter((node) => !node.forbidden && !node.service);
const GRADES = ['1급', '2급', '3급', '4급', '5급', '6급'];
const FALLBACK_ROBOTS = [
  { id: 'SW-01', status: '대기', battery: 0, floor: '1F', homeSeq: 0 },
  { id: 'SW-02', status: '대기', battery: 0, floor: 'B1', homeSeq: 0 },
  { id: 'SW-03', status: '대기', battery: 0, floor: 'B1', homeSeq: 0 },
];

function emptyPassenger() {
  return { name: '', age: '', severity: '중증', grade: '1급', staff: '' };
}

function emptyDraft() {
  return { startId: '', destinationId: '', floor: '1F', picking: 'start', passenger: emptyPassenger() };
}

function spotTitle(spot) {
  return `${FLOOR_NAME[spot.floor] || spot.floor} · ${spot.label.replace(/^B[12]\s/, '')}`;
}

export default function AndroidConsole() {
  const [robots, setRobots] = useState(FALLBACK_ROBOTS);
  const [robotId, setRobotId] = useState('SW-01');
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState('관제 노트북이 같은 주소로 접속해 있으면 오더가 바로 전달됩니다.');
  const [tone, setTone] = useState('info');
  const [storage, setStorage] = useState('');
  const [sending, setSending] = useState(false);
  const homeSeenRef = useRef({});
  const robotIdRef = useRef(robotId);
  robotIdRef.current = robotId;
  const draft = drafts[robotId] || emptyDraft();
  const { startId, destinationId, floor, passenger } = draft;
  const picking = draft.picking || (startId ? 'destination' : 'start');
  const floorSpots = SPOTS.filter((spot) => spot.floor === floor);

  const updateDraft = (robot, patch) => {
    setDrafts((current) => {
      const prev = current[robot] || emptyDraft();
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      return { ...current, [robot]: next };
    });
  };

  useEffect(() => {
    let stop = false;
    const pull = async () => {
      try {
        const fleet = await fetchFleet();
        if (stop) return;
        setStorage(fleet.storage || '');
        if (fleet.robots?.length) {
          const resetIds = [];
          for (const robot of fleet.robots) {
            const seq = robot.homeSeq || 0;
            const seen = homeSeenRef.current[robot.id];
            if (seen === undefined) {
              homeSeenRef.current[robot.id] = seq;
              continue;
            }
            if (seen !== seq) {
              homeSeenRef.current[robot.id] = seq;
              resetIds.push(robot.id);
            }
          }
          setRobots(fleet.robots);
          setRobotId((current) => {
            const chosen = fleet.robots.find((robot) => robot.id === current);
            if (chosen && !batteryDrained(chosen)) return current;
            return fleet.robots.find((robot) => !batteryDrained(robot))?.id || '';
          });
          if (resetIds.length) {
            setDrafts((current) => {
              const next = { ...current };
              for (const id of resetIds) next[id] = emptyDraft();
              return next;
            });
            if (resetIds.includes(robotIdRef.current)) {
              setTone('info');
              setMessage(`${robotIdRef.current}이 자기 충전 부스에 도착해 출발지, 도착지, 고객 정보를 초기화했습니다.`);
            }
          }
        }
      } catch {
        if (!stop) setStorage('');
      }
    };
    pull();
    const timer = setInterval(pull, 2000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, []);

  const submit = async () => {
    setSending(true);
    try {
      if (batteryDrained(robots.find((robot) => robot.id === robotId) || {})) {
        setTone('warn');
        setMessage('배터리가 10% 미만인 휠체어는 충전 복귀 중이라 선택할 수 없습니다.');
        return;
      }
      const result = await sendOrder({
        robotId,
        startId,
        destinationId,
        passenger,
      });
      const start = SPOTS.find((spot) => spot.id === startId);
      const destination = SPOTS.find((spot) => spot.id === destinationId);
      setTone('ok');
      setStorage(result.storage || storage);
      setMessage(`${result.order.robotId} 오더를 보냈습니다. ${spotTitle(start)} → ${spotTitle(destination)}`);
    } catch (error) {
      setTone('warn');
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="android-shell">
      <header className="android-top">
        <div className="android-brand">
          <svg className="android-mark" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="23" fill="#ffffff" />
            <circle cx="24" cy="24" r="20" fill="#0054A6" />
            <text x="24" y="32" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="800" fontFamily="Arial, sans-serif">K</text>
          </svg>
          <div>
            <p>KORAIL</p>
            <h1>수서역 휠체어 오더</h1>
          </div>
        </div>
        <span className="android-link">{storage === 'redis' ? '실시간 서버' : storage === 'memory' ? '서버 연결' : '연결 확인 중'}</span>
      </header>

      <div className="android-scroll">
      <p className={`android-message ${tone}`}>{message}</p>

      <section className="android-card" style={{ '--pick': Math.max(0, robots.findIndex((robot) => robot.id === robotId)) }}>
        <h2>운행 로봇</h2>
        <div className="android-robots">
          {robots.map((robot) => {
            const drained = batteryDrained(robot);
            return (
              <button
                key={robot.id}
                className={`${robot.id === robotId ? 'selected' : ''} ${drained ? 'drained' : ''}`}
                disabled={drained}
                onClick={() => setRobotId(robot.id)}
              >
                <b>{robot.id}</b>
                <small>{drained ? '충전 복귀' : (robot.status || '대기')}</small>
                <small>{robot.floor || '-'} · {robot.battery || 0}%</small>
              </button>
            );
          })}
        </div>

        <div className="android-drop">
          <div className="android-route">
            <label className={picking === 'start' ? 'is-picking start' : ''}>출발지
              <select
                value={startId}
                onFocus={() => updateDraft(robotId, { picking: 'start' })}
                onChange={(event) => {
                  const nextStart = event.target.value;
                  updateDraft(robotId, (prev) => ({
                    ...prev,
                    picking: 'start',
                    startId: nextStart,
                    destinationId: prev.destinationId === nextStart ? '' : prev.destinationId,
                  }));
                }}
              >
                <option value="">선택</option>
                {SPOTS.map((spot) => <option key={spot.id} value={spot.id}>{spotTitle(spot)}</option>)}
              </select>
            </label>
            <label className={picking === 'destination' ? 'is-picking destination' : ''}>도착지
              <select
                value={destinationId}
                onFocus={() => updateDraft(robotId, { picking: 'destination' })}
                onChange={(event) => {
                  const nextId = event.target.value;
                  const spot = SPOTS.find((item) => item.id === nextId);
                  updateDraft(robotId, {
                    picking: 'destination',
                    destinationId: nextId,
                    floor: spot?.floor || floor,
                  });
                }}
              >
                <option value="">선택</option>
                {SPOTS.filter((spot) => spot.id !== startId).map((spot) => (
                  <option key={spot.id} value={spot.id}>{spotTitle(spot)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="android-pick" role="group" aria-label="네모 칸으로 고를 항목">
            <button type="button" data-role="start" className={picking === 'start' ? 'selected' : ''} aria-pressed={picking === 'start'} onClick={() => updateDraft(robotId, { picking: 'start' })}>출발지 선택</button>
            <button type="button" data-role="destination" className={picking === 'destination' ? 'selected' : ''} aria-pressed={picking === 'destination'} onClick={() => updateDraft(robotId, { picking: 'destination' })}>도착지 선택</button>
          </div>
          <p className={`android-pick-hint ${picking}`}>
            {picking === 'start' ? '아래 칸은 출발지에 들어갑니다.' : '아래 칸은 도착지에 들어갑니다.'}
          </p>
          <div className="android-floors">
            {Object.entries(FLOOR_NAME).map(([id, label]) => (
              <button key={id} className={floor === id ? 'selected' : ''} onClick={() => updateDraft(robotId, { floor: id })}>{label}</button>
            ))}
          </div>
          <div className="android-spots">
            {floorSpots.map((spot) => {
              const isStart = spot.id === startId;
              const isDestination = spot.id === destinationId;
              const active = picking === 'start' ? isStart : isDestination;
              const blocked = picking === 'start' ? isDestination : isStart;
              return (
                <button
                  key={spot.id}
                  type="button"
                  className={`${isStart ? 'is-start' : ''} ${isDestination ? 'is-destination' : ''} ${active ? 'selected' : ''}`}
                  disabled={blocked}
                  onClick={() => {
                    if (picking === 'start') {
                      updateDraft(robotId, (prev) => ({
                        ...prev,
                        startId: spot.id,
                        destinationId: prev.destinationId === spot.id ? '' : prev.destinationId,
                        picking: 'destination',
                      }));
                      return;
                    }
                    updateDraft(robotId, { destinationId: spot.id });
                  }}
                >
                  {(isStart || isDestination) && <small>{isStart ? '출발' : '도착'}</small>}
                  {spot.label.replace(/^B[12]\s/, '')}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="android-card">
        <h2>이용정보 등록</h2>
        <div className="android-form">
        <label>이름
          <input value={passenger.name} placeholder="홍길동" onChange={(event) => updateDraft(robotId, (prev) => ({ ...prev, passenger: { ...prev.passenger, name: event.target.value } }))} />
        </label>
        <label>나이
          <input inputMode="numeric" value={passenger.age} placeholder="65" onChange={(event) => updateDraft(robotId, (prev) => ({ ...prev, passenger: { ...prev.passenger, age: event.target.value.replace(/[^\d]/g, '').slice(0, 3) } }))} />
        </label>
        <label>장애 정도
          <select value={passenger.severity} onChange={(event) => updateDraft(robotId, (prev) => ({ ...prev, passenger: { ...prev.passenger, severity: event.target.value } }))}>
            <option value="중증">중증</option>
            <option value="경증">경증</option>
          </select>
        </label>
        <label>등급
          <select value={passenger.grade} onChange={(event) => updateDraft(robotId, (prev) => ({ ...prev, passenger: { ...prev.passenger, grade: event.target.value } }))}>
            {GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
          </select>
        </label>
        <label className="wide">담당 역무원
          <input value={passenger.staff} placeholder="김역무" onChange={(event) => updateDraft(robotId, (prev) => ({ ...prev, passenger: { ...prev.passenger, staff: event.target.value } }))} />
        </label>
        </div>
        <p className="android-hint">이름, 나이, 장애 정보와 담당 역무원을 입력합니다. 고객 없이 보내려면 이름, 나이, 역무원을 비워 두세요.</p>
      </section>
      </div>

      <button className="android-submit" disabled={sending || !robotId || !startId || !destinationId || batteryDrained(robots.find((robot) => robot.id === robotId) || {})} onClick={submit}>
        {sending ? '전송 중' : '관제 화면으로 오더 전송'}
      </button>
    </section>
  );
}
