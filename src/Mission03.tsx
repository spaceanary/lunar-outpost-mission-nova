import { useState } from 'react';
import './Mission03.css';

export type M3Resources = { power: number; oxygen: number; water: number; co2: number; safety: number };
export const initialM3: M3Resources = { power: 70, oxygen: 85, water: 80, co2: 12, safety: 90 };
type Phase = 'investigate' | 'align' | 'power' | 'transmit' | 'complete';
const evidence = [
  { title: 'How signals travel', fact: 'Radio signals travel at the speed of light. The Earth–Moon distance changes, so one-way radio travel time is roughly 1.3 seconds, not instantaneous.', question: 'Why does Mission Control not receive a reply instantly?', answer: 'Even radio signals need time to cross space.', url: 'https://www.nasa.gov/directorates/somd/space-communications-navigation-program/' },
  { title: 'Point toward Earth', fact: 'Directional antennas work best when aimed at the receiver. Terrain and the Moon itself can block a direct radio path.', question: 'What might block a direct link?', answer: 'A ridge or the Moon between the antenna and Earth.', url: 'https://www.nasa.gov/directorates/somd/space-communications-navigation-program/' },
  { title: 'Backup communications', fact: 'Spacecraft communications depend on antennas, electrical power, radios, and sometimes relay spacecraft. A backup route may be needed when direct visibility is lost.', question: 'Why keep a backup plan?', answer: 'One failed path should not end the mission.', url: 'https://www.nasa.gov/directorates/somd/space-communications-navigation-program/' },
];
const clamp = (x: number) => Math.max(0, Math.min(100, x));

type Props = { onUpdate: (r: M3Resources) => void; onComplete: () => void; onWisdom: () => void; onRestart: () => void; onReturn: () => void; speak: (text: string) => void };
export default function Mission03({ onUpdate, onComplete, onWisdom, onRestart, onReturn, speak }: Props) {
  const [phase, setPhase] = useState<Phase>('investigate');
  const [reviewed, setReviewed] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [angle, setAngle] = useState(15);
  const [powerChoice, setPowerChoice] = useState<'science' | 'life' | 'wait' | null>(null);
  const [messageChoice, setMessageChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('Inspect three NASA science clues to begin.');
  const [resources, setResources] = useState<M3Resources>(initialM3);
  // The target angle, signal percentage, and packet budget are fictional game mechanics.
  const target = 65;
  const signal = Math.round(clamp(100 - Math.abs(angle - target) * 2.5));
  const publish = (r: M3Resources) => { setResources(r); onUpdate(r); };
  const say = (message: string) => { setFeedback(message); speak(message); };
  const advanceAlignment = () => {
    if (signal < 80) { say('Signal is still weak. Try aiming the antenna closer to Earth. Watch the signal meter.'); return; }
    setPhase('power');
    say('Excellent alignment, Commander! Now our backup transmitter needs power. Which system can safely give up some energy?');
  };
  const choosePower = (choice: 'science' | 'life' | 'wait') => {
    setPowerChoice(choice);
    if (choice === 'life') { publish({ ...resources, safety: clamp(resources.safety - 12), oxygen: clamp(resources.oxygen - 10) }); say('Life support is essential. Taking its power risks the crew. Try a safer source.'); return; }
    if (choice === 'wait') { say('Waiting without a plan may delay critical safety information. Look for a nonessential system we can pause.'); return; }
    publish({ ...resources, power: clamp(resources.power - 8) });
    setPhase('transmit');
    say('Good call! Optional science is paused, life support stays protected, and the backup transmitter is online. We have room for one short message. What comes first?');
  };
  const transmit = (choice: number) => {
    setMessageChoice(choice);
    if (choice !== 0) { say(choice === 1 ? 'Science images are valuable, but crew safety is more urgent. Try again.' : 'A routine greeting can wait. Send the critical information first.'); return; }
    publish({ ...resources, power: clamp(resources.power - 8), safety: clamp(resources.safety + 5) });
    setPhase('complete');
    onComplete();
    say('Mission accomplished, Commander! You diagnosed the signal, protected life support, and sent the crew safety report first. Mission Control has our message!');
  };
  return <div className="m3-root">
    <span className="panel-kicker">MISSION 03 · NASA COMMUNICATIONS INSPIRED</span>
    <h2>📡 The Last Signal</h2>
    <p className="m3-lead">NOVA: “Commander, our simulated lunar outpost has lost its primary Earth link. Investigate the science, realign the antenna, and decide what matters most.”</p>
    <div className="m3-progress" aria-label="Mission stages">{(['Investigate','Experiment','Power','Transmit','Success'] as const).map((name,i)=><span key={name} className={(phase === 'investigate' ? 0 : phase === 'align' ? 1 : phase === 'power' ? 2 : phase === 'transmit' ? 3 : 4) >= i ? 'm3-step-done' : ''}>{i+1}. {name}</span>)}</div>
    {phase === 'investigate' && <>
      <h3>🔬 Investigate NASA science</h3>
      <p className="m3-muted">Explore each clue. These principles are real; the emergency in this game is fictional.</p>
      <div className="m3-evidence">{evidence.map((item,i)=><button key={item.title} type="button" className={active===i?'m3-selected':''} onClick={()=>{setActive(i);setReviewed(v=>v.includes(i)?v:[...v,i]);speak(item.answer);}}><strong>0{i+1} · {item.title}</strong><small>{reviewed.includes(i)?'✓ Investigated':'Explore clue'}</small></button>)}</div>
      {active!==null && <div className="m3-clue"><strong>{evidence[active].question}</strong><p>{evidence[active].fact}</p><p><strong>NOVA's clue:</strong> {evidence[active].answer}</p><a href={evidence[active].url} target="_blank" rel="noopener noreferrer">NASA communications reference ↗</a></div>}
      <button type="button" className="control-primary" disabled={reviewed.length!==3} onClick={()=>{setPhase('align');say('Commander, the antenna is off target. Move the aiming control until our Earth signal becomes strong.');}}>📡 {reviewed.length===3?'Open Antenna Console':`Review all clues · ${reviewed.length}/3`}</button>
    </>}
    {phase === 'align' && <>
      <h3>🎯 Aim the antenna</h3>
      <p className="m3-muted">Experiment: adjust the simulated antenna to find the strongest Earth link. This signal model is illustrative, not NASA telemetry.</p>
      <div className="m3-antenna" aria-label="Illustrative antenna and Earth alignment"><span style={{transform:`rotate(${angle-65}deg)`}}>📡</span><div className="m3-beam" style={{opacity:Math.max(.12,signal/100)}}/><span>🌍</span></div>
      <label htmlFor="m3-aim">Antenna direction: <strong>{angle}°</strong></label>
      <input id="m3-aim" type="range" min="0" max="100" step="5" value={angle} onChange={e=>setAngle(Number(e.target.value))}/>
      <div className="m3-meter"><div style={{width:`${signal}%`}}/></div><strong>Signal strength: {signal}% · {signal>=80?'STRONG':signal>=40?'WEAK':'NO RELIABLE LINK'}</strong>
      <button type="button" className="control-primary" onClick={advanceAlignment}>✓ Test Connection</button>
    </>}
    {phase === 'power' && <>
      <h3>⚡ Protect the critical systems</h3>
      <p>The backup transmitter needs energy. What should you do?</p>
      <div className="m3-options"><button onClick={()=>choosePower('science')}>A · Pause optional science and power the backup transmitter</button><button onClick={()=>choosePower('life')}>B · Take power from oxygen and air processing</button><button onClick={()=>choosePower('wait')}>C · Wait and hope the signal fixes itself</button></div>
      {powerChoice && <p className="m3-feedback" role="status">{feedback}</p>}
    </>}
    {phase === 'transmit' && <>
      <h3>📨 One short transmission</h3>
      <p>Our connection is back, but this fictional communication window has limited capacity. What should Mission Control receive first?</p>
      <div className="m3-options"><button onClick={()=>transmit(0)}>A · Crew safety status and critical engineering fault</button><button onClick={()=>transmit(1)}>B · Full-resolution science photographs</button><button onClick={()=>transmit(2)}>C · A friendly greeting from the crew</button></div>
      {messageChoice!==null && <p className="m3-feedback" role="status">{feedback}</p>}
    </>}
    {phase === 'complete' && <div className="m3-finale" role="status"><span className="panel-kicker">MISSION 03 COMPLETE</span><h3>🏅 Signal Restored!</h3><p>{feedback}</p><div className="m3-achievement">💡 MISSION WISDOM 03 UNLOCKED<h3>Stay Connected, Stay Prepared</h3><p>Investigate the problem. Test a solution. Protect essential systems. Communicate the most urgent information first.</p></div><button className="control-primary" onClick={onWisdom}>💡 View Mission Wisdom</button><button className="control-secondary" onClick={onRestart}>↻ Try Again</button><button className="control-secondary" onClick={onReturn}>🏠 Return to Outpost</button></div>}
    {phase!=='complete' && <p className="m3-status" role="status">🤖 NOVA: {feedback}</p>}
    <p className="m3-disclaimer">NASA SOURCE vs SIMULATION: Radio propagation, antenna pointing and communications planning are real principles. The antenna angles, signal percentages, outage, resource impacts and message window are fictional educational mechanics. NASA does not endorse this game.</p>
  </div>;
}
