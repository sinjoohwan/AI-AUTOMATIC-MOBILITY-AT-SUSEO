import React, { useState } from 'react';
import { setDrivingRule } from '../simulation.js';
import { createTrainer, deriveImprovements, improvementProposals, runScenarios, TARGET_SCORE } from '../training.js';

const PHASE = {
  idle: '대기',
  running: '학습 중',
  testing: '시나리오 테스트',
  propose: '개선 제안',
  done: '완료',
};

export default function LearnMode() {
  const [phase, setPhase] = useState('idle');
  const [score, setScore] = useState(0);
  const [episodes, setEpisodes] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [notes, setNotes] = useState([]);
  const [proposals, setProposals] = useState([]);

  const start = async () => {
    if (phase === 'running' || phase === 'testing') return;
    const trainer = createTrainer();
    setPhase('running');
    setScore(0);
    setEpisodes([]);
    setScenarios([]);
    setNotes([]);
    setProposals([]);
    let latest = [];
    let total = 0;
    while (!trainer.finished && trainer.episodes.length < 24) {
      const row = trainer.step();
      if (!row) break;
      latest = trainer.episodes.slice();
      total = trainer.score;
      setEpisodes(latest);
      setScore(total);
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (total >= TARGET_SCORE) break;
    }
    if (total < TARGET_SCORE) {
      setNotes(['30점에 닿기 전에 회차가 끝났습니다. 아래 제안 중에서 코드에 남길 항목을 골라 주세요.']);
      setProposals(improvementProposals(latest, []));
      setPhase('propose');
      return;
    }
    setPhase('testing');
    await new Promise((resolve) => setTimeout(resolve, 30));
    const tests = runScenarios();
    setScenarios(tests);
    setNotes(deriveImprovements(latest, tests));
    setProposals(improvementProposals(latest, tests));
    setPhase('propose');
  };

  const chooseProposal = (id, accepted) => {
    setDrivingRule(id, accepted);
    const next = proposals.map((item) => (item.id === id ? { ...item, choice: accepted ? 'yes' : 'no' } : item));
    setProposals(next);
    if (next.every((item) => item.choice)) setPhase('done');
  };

  return (
    <section className="learn-shell">
      <header>
        <p>KORAIL 수서역</p>
        <h1>강화학습 모드</h1>
        <span>{PHASE[phase]}</span>
      </header>
      <div className="learn-score">
        <strong>{score}</strong>
        <small>목표 {TARGET_SCORE}점 · 1분 10점 · 2분 5점 · 3분 초과 -10점</small>
      </div>
      <button type="button" className="learn-start" onClick={start} disabled={phase === 'running' || phase === 'testing' || phase === 'propose'}>
        {phase === 'running' ? '학습 진행 중' : phase === 'testing' ? '시나리오 테스트 중' : phase === 'propose' ? '개선안을 선택하세요' : '학습 시작'}
      </button>
      <ol className="learn-log">
        {episodes.map((row) => (
          <li key={`${row.index}-${row.label}`}>
            <b>{row.robotId}</b>
            <span>{row.label}</span>
            <em className={row.points > 0 ? 'plus' : 'minus'}>{row.points > 0 ? `+${row.points}` : row.points}</em>
            <small>{row.arrived ? `${row.seconds}초` : '미도착'} · 누적 {row.total}</small>
          </li>
        ))}
      </ol>
      {scenarios.length > 0 && (
        <div className="learn-tests">
          <h2>시나리오 테스트</h2>
          {scenarios.map((row) => (
            <p key={row.label}><b>{row.robotId}</b> {row.label} · {row.arrived ? `${row.seconds}초 ${row.points}점` : '실패'}</p>
          ))}
        </div>
      )}
      {notes.length > 0 && (
        <div className="learn-notes">
          <h2>학습 결과</h2>
          {notes.map((note) => <p key={note}>{note}</p>)}
        </div>
      )}
      {proposals.length > 0 && (
        <div className="learn-proposals">
          <h2>개발 코드 개선 제안</h2>
          <p>학습에서 나온 고칠 점입니다. 각 항목을 코드 규칙으로 남길지 골라 주세요.</p>
          {proposals.map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              {item.choice ? (
                <strong>{item.choice === 'yes' ? '네 · 채택' : '아니오 · 보류'}</strong>
              ) : (
                <div>
                  <button type="button" onClick={() => chooseProposal(item.id, true)}>네</button>
                  <button type="button" onClick={() => chooseProposal(item.id, false)}>아니오</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
