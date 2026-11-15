import { useState } from 'react';
import './Mission02.css';

export type M2Resources = {
  power: number;
  oxygen: number;
  water: number;
  co2: number;
  safety: number;
};
export const initialM2: M2Resources = {
  power: 70,
  oxygen: 85,
  water: 80,
  co2: 12,
  safety: 90,
};
type System = 'air' | 'water' | 'comms' | 'science';
type Allocation = Record<System, number>;
const initialAllocation: Allocation = {
  air: 20,
  water: 15,
  comms: 5,
  science: 35,
};
const evidence = [
  {
    title: 'Apollo 13: the failure',
    label: 'NASA · HISTORICAL EVENT',
    detail:
      'On April 13, 1970, an oxygen tank exploded aboard Apollo 13. The command/service module lost vital oxygen and electrical-generation capability. The crew used the lunar module as a lifeboat.',
    lesson: 'A failure can cascade across interconnected spacecraft systems.',
    url: 'https://www.nasa.gov/missions/apollo/apollo-13-mission-details/',
  },
  {
    title: 'Conserving consumables',
    label: 'NASA · MISSION RECORD',
    detail:
      'Apollo 13 controllers and crew conserved electrical power, oxygen and water to make the return to Earth possible.',
    lesson:
      'Preserving one resource must not compromise another essential system.',
    url: 'https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_13a_Summary.htm',
  },
  {
    title: 'The CO₂ filter problem',
    label: 'NASA · REAL ENGINEERING',
    detail:
      'Apollo 13 astronauts faced rising carbon dioxide in the lunar module. Engineers developed an adapter to use available lithium hydroxide cartridges.',
    lesson:
      'Oxygen supply and carbon dioxide removal are different life-support needs. They need power to function',
    url: 'https://www.nasa.gov/ochmo-tb-004-carbon-dioxide-2/',
  },
  {
    title: 'How life support works',
    label: 'NASA · MODERN TECHNOLOGY',
    detail:
      'NASA Environmental Control and Life Support Systems (ECLSS) technology includes water recovery, oxygen generation and air revitalization.',
    lesson:
      'Onboard recycling and air management depend on functioning equipment and power.',
    url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/',
  },
];
const RECOMMENDED_RESERVE = 30; // Fictional mission-planning target, not a NASA requirement.
const MIN_AIR = 35; // Simulation units, not physiological limits.
const MIN_WATER = 20;
const MIN_COMMS = 5; // Simulation units, not physiological limits.
const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
const defs: { id: System; title: string; note: string }[] = [
  {
    id: 'air',
    title: 'Air revitalization',
    note: 'Oxygen processing, circulation and CO₂ removal',
  },
  { id: 'water', title: 'Water recovery', note: 'Recover and process water' },
  { id: 'comms', title: 'Communications', note: 'Maintain the Earth link' },
  {
    id: 'science',
    title: 'Optional science',
    note: 'Can be paused during emergencies',
  },
];
type Props = {
  onUpdate: (resources: M2Resources) => void;
  onComplete: () => void;
  onWisdom: () => void;
  onRestart: () => void;
  onReturn: () => void;
  speak: (text: string) => void;
};
export default function Mission02({
  onUpdate,
  onComplete,
  onWisdom,
  onRestart,
  onReturn,
  speak,
}: Props) {
  const [phase, setPhase] = useState<
    'investigate' | 'allocate' | 'emergency' | 'complete'
  >('investigate');
  const [seen, setSeen] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [allocation, setAllocation] = useState<Allocation>(initialAllocation);
  const [resources, setResources] = useState<M2Resources>(initialM2);
  const [cycle, setCycle] = useState(0);
  const [roundFeedback, setRoundFeedback] = useState('');
  const [log, setLog] = useState('Inspect NASA evidence to begin.');
  const [emergencyChoice, setEmergencyChoice] = useState<number | null>(null);
  const total = (Object.keys(allocation) as System[]).reduce(
    (sum, key) => sum + allocation[key],
    0
  );
  const remaining = 100 - total;
  const publish = (r: M2Resources) => {
    setResources(r);
    onUpdate(r);
  };
  const runCycle = () => {
    if (total > 100 || cycle >= 2) return;
    if (
      cycle === 0 &&
      (allocation.air < MIN_AIR ||
        allocation.water < MIN_WATER ||
        allocation.comms < MIN_COMMS ||
        remaining < RECOMMENDED_RESERVE)
    ) {
      const msg =
        'Not ready for launch. Protect air (35), water (20), communications (5), and 30 reserve units. Reduce optional science to make room.';
      setRoundFeedback(msg);
      speak(msg);
      return;
    }
    if (
      cycle === 1 &&
      (allocation.air < MIN_AIR ||
        allocation.water < MIN_WATER ||
        allocation.comms < MIN_COMMS ||
        remaining < RECOMMENDED_RESERVE + 10)
    ) {
      const msg =
        'The power shortage requires 40 reserve units for this round. Keep air at 35, water at 20 and communications at 5; pause optional science to zero.';
      setRoundFeedback(msg);
      speak(msg);
      return;
    }
    setRoundFeedback('');
    // Deterministic educational model. These values are not NASA telemetry or medical thresholds.
    const r: M2Resources = {
      power: clamp(resources.power - (12 + Math.ceil(total / 12))),
      oxygen: clamp(
        resources.oxygen +
          (allocation.air >= MIN_AIR ? -2 : allocation.air >= 20 ? -10 : -18)
      ),
      water: clamp(
        resources.water + (allocation.water >= MIN_WATER ? -3 : -12)
      ),
      co2: clamp(
        resources.co2 +
          (allocation.air >= MIN_AIR ? 5 : allocation.air >= 20 ? 15 : 25)
      ),
      safety: clamp(
        resources.safety -
          (allocation.air < MIN_AIR ? 12 : 0) -
          (allocation.water < MIN_WATER ? 6 : 0)
      ),
    };
    publish(r);
    const next = cycle + 1;
    setCycle(next);
    const message = `Round ${next} complete. ${
      allocation.air < MIN_AIR ? 'Air revitalization was underpowered. ' : ''
    }${
      allocation.water < MIN_WATER ? 'Water recovery was underpowered. ' : ''
    }Power and water are being consumed. ${
      next === 2
        ? 'A new CO₂ filter complication has appeared!'
        : 'A solar-array fault has reduced our flexibility. For Round 2, protect 40 reserve units by pausing optional science.'
    }`;
    setLog(message);
    speak(message);
    if (next === 2) setPhase('emergency');
  };
  const respond = (index: number) => {
    setEmergencyChoice(index);
    if (index === 0) {
      // Recovery requires an actual source of power to redirect.
      const availableForRecovery = allocation.science + Math.max(0, remaining);
      if (availableForRecovery < 10 || resources.power < 10) {
        const msg =
          'Not enough power is available to restore the CO₂ filter. Restart and protect a reserve or keep at least 10 units in optional science for emergency reassignment.';
        setLog(msg);
        speak(msg);
        return;
      }
      const r: M2Resources = {
        power: clamp(resources.power - 10),
        oxygen: clamp(resources.oxygen - 2),
        water: clamp(resources.water - 2),
        co2: clamp(resources.co2 - 22),
        safety: clamp(resources.safety + 5),
      };
      publish(r);
      setPhase('complete');
      setLog(
        'Good recovery! You reassigned available power to CO₂ removal. Crew safety improved, but energy remains limited.'
      );
      speak(
        'Good recovery, Commander! You used available power to restore carbon dioxide removal.'
      );
      onComplete();
    } else {
      const msg =
        index === 1
          ? 'Stored water can temporarily help, but it does not fix a failing CO₂-removal system. Try again.'
          : 'Waiting while CO₂ rises is not a safe plan. Try again.';
      setLog(msg);
      speak(msg);
    }
  };
  return (
    <div className="m2-root">
      <span className="panel-kicker">MISSION 02 · APOLLO 13 INSPIRED</span>
      <h2>⚡ Power Under Pressure</h2>
      <p className="m2-intro">
        NOVA: “Commander, a simulated electrical fault is draining our lunar
        outpost. We must protect breathable air, water and the crew. Investigate
        real NASA history, then manage the crisis!”
      </p>
      {phase === 'investigate' && (
        <>
          <div className="evidence-progress">
            NASA evidence reviewed: {seen.length} / {evidence.length}
          </div>
          <div className="m2-evidence-grid">
            {evidence.map((item, i) => (
              <button
                type="button"
                key={item.title}
                className={`m2-evidence ${active === i ? 'm2-active' : ''}`}
                onClick={() => {
                  setActive(i);
                  setSeen((p) => (p.includes(i) ? p : [...p, i]));
                  speak(item.lesson);
                }}
              >
                <span className="m2-evidence-number">0{i + 1}</span>
                <strong>{item.title}</strong>
                <small>
                  {seen.includes(i) ? '✓ Investigated' : 'Investigate'}
                </small>
              </button>
            ))}
          </div>
          {active !== null && (
            <div className="evidence-detail">
              <span className="evidence-source-label">
                {evidence[active].label}
              </span>
              <h3>{evidence[active].title}</h3>
              <p>{evidence[active].detail}</p>
              <p>
                <strong>NOVA'S SCIENCE CLUE:</strong> {evidence[active].lesson}
              </p>
              <a
                href={evidence[active].url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View original NASA source ↗
              </a>
            </div>
          )}
          <button
            className="control-primary"
            disabled={seen.length !== evidence.length}
            onClick={() => {
              setPhase('allocate');
              speak(
                'Evidence complete. Your initial allocation is unsafe. Adjust it to protect life support and emergency reserve.'
              );
            }}
          >
            {' '}
            {seen.length === evidence.length
              ? '⚡ Open Power Console'
              : '🔒 Investigate All Four Clues'}
          </button>
        </>
      )}
      {phase === 'allocate' && (
        <>
          <div className="m2-summary">
            <strong>
              {cycle === 0
                ? 'ROUND 1 · BUILD A SAFE BASE'
                : 'ROUND 2 · ADAPT TO A POWER SHORTAGE'}
            </strong>
            <span
              className={
                remaining < RECOMMENDED_RESERVE + (cycle === 1 ? 10 : 0)
                  ? 'm2-danger'
                  : ''
              }
            >
              Unallocated: {remaining} / 100 units
            </span>
          </div>
          <p className="m2-help">
            {cycle === 0
              ? 'Commander: build a safe base. Allocate power for air, water and Earth communications, while keeping 30 units unallocated for emergencies.'
              : 'New challenge: a solar-array fault! Keep 40 units unallocated so we can respond. What can you safely pause?'}{' '}
            Unallocated units are a planning reserve, not stored battery energy.
            These are game-design targets, not NASA standards.
          </p>
          <div className="m2-guidance" role="status">
            <strong>🤖 NOVA · Mission planning guidance</strong>
            <span
              className={remaining < RECOMMENDED_RESERVE ? 'm2-danger' : ''}
            >
              {remaining < 0
                ? 'Over budget: reduce allocations.'
                : remaining < RECOMMENDED_RESERVE + (cycle === 1 ? 10 : 0)
                ? `Reserve too low: target ${
                    RECOMMENDED_RESERVE + (cycle === 1 ? 10 : 0)
                  } units. Reduce optional science first.`
                : `Reserve target met: ${remaining} units available.`}
            </span>
            <span>
              Life-support targets: air ≥ {MIN_AIR} units (
              {allocation.air >= MIN_AIR ? 'met' : 'underpowered'}); water ≥{' '}
              {MIN_WATER} units (
              {allocation.water >= MIN_WATER ? 'met' : 'underpowered'}). These
              are simulated engineering allocations.
            </span>
            <span>
              Earth link: at least {MIN_COMMS} units. Optional science starts at
              35 units; it can be reduced to zero.{' '}
              {cycle === 0
                ? 'Try to make your first safe allocation.'
                : 'Science can be paused during the shortage.'}
            </span>
          </div>
          {defs.map((d) => (
            <div className="m2-control" key={d.id}>
              <div className="m2-control-heading">
                <strong>{d.title}</strong>
                <b>{allocation[d.id]} units</b>
              </div>
              <small>{d.note}</small>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={allocation[d.id]}
                onChange={(e) =>
                  setAllocation((p) => ({
                    ...p,
                    [d.id]: Number(e.target.value),
                  }))
                }
                aria-label={`${d.title} power allocation`}
              />
            </div>
          ))}
          <div className="m2-facts">
            <span title="Simulated remaining battery energy, separate from the 100-unit allocation budget">
              🔋 Battery energy {resources.power}%
            </span>
            <span>🫧 Oxygen {resources.oxygen}%</span>
            <span>💧 Water {resources.water}%</span>
            <span>🌫 CO₂ risk {resources.co2}%</span>
          </div>
          <button
            className="control-primary"
            disabled={remaining < 0}
            onClick={runCycle}
          >
            ▶ {cycle === 0 ? 'Test My Base Plan' : 'Respond to Power Shortage'}
          </button>
          {roundFeedback && (
            <p className="m2-warning" role="status">
              🤖 NOVA: {roundFeedback}
            </p>
          )}
          {remaining < 0 && (
            <p className="m2-danger">
              You allocated more than 100 units. Reduce one or more systems.
            </p>
          )}
        </>
      )}
      {phase === 'emergency' && (
        <>
          <div className="m2-warning">⚠️ SECONDARY EMERGENCY · CO₂ REMOVAL</div>
          <p>
            NOVA: “Our air-filter performance is deteriorating. Oxygen is still
            available, but CO₂ is building up. What should we do now?”
          </p>
          <div className="control-choices">
            {[
              'Redirect available power from optional science or reserve to CO₂ removal; inspect the filter.',
              'Shut down water recovery and assume that solves the CO₂ problem.',
              'Wait for CO₂ to decrease on its own.',
            ].map((answer, i) => (
              <button
                type="button"
                className="control-choice"
                key={answer}
                onClick={() => respond(i)}
              >
                <strong>
                  {String.fromCharCode(65 + i)}. {answer}
                </strong>
              </button>
            ))}
          </div>
          {emergencyChoice !== null && phase === 'emergency' && (
            <p className="m2-danger" role="status">
              {log}
            </p>
          )}
        </>
      )}
      {phase === 'complete' && (
        <div className="m2-finale" role="status">
          <div className="m2-finale-heading">
            <span aria-hidden="true">🏅</span>
            <div>
              <span className="panel-kicker">MISSION 02 COMPLETE</span>
              <h3>The Outpost Is Safe!</h3>
            </div>
          </div>
          <p>
            <strong>🤖 NOVA:</strong> “Excellent recovery, Commander! You
            restored CO₂ removal and protected the crew. Power is still limited,
            so careful monitoring and conservation must continue.”
          </p>
          <div className="m2-finale-stats">
            <div>
              <span>⚡ POWER</span>
              <strong>{resources.power}%</strong>
              <small>Remaining</small>
            </div>
            <div>
              <span>🌫 CO₂ RISK</span>
              <strong>{resources.co2}%</strong>
              <small>Reduced</small>
            </div>
            <div>
              <span>🛡 CREW SAFETY</span>
              <strong>{resources.safety}%</strong>
              <small>Current</small>
            </div>
          </div>
          <div className="m2-finale-wisdom">
            <strong>💡 MISSION WISDOM 02 UNLOCKED</strong>
            <h3>Every Watt Counts</h3>
            <p>
              Protect critical systems, preserve reserves and adapt when new
              evidence changes the mission. Oxygen availability alone is not
              enough: CO₂ must also be controlled.
            </p>
          </div>
          <a
            className="m2-nasa-link"
            href="https://www.nasa.gov/missions/apollo/apollo-13-mission-details/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the real Apollo 13 story at NASA ↗
          </a>
          <button type="button" className="control-primary" onClick={onWisdom}>
            💡 Unlock Mission Wisdom
          </button>
          <button type="button" className="control-primary" onClick={onRestart}>
            ↻ Try Another Strategy
          </button>
          <button
            type="button"
            className="control-secondary"
            onClick={onReturn}
          >
            🏠 Return to Lunar Outpost
          </button>
        </div>
      )}
      {phase !== 'complete' && (
        <div className="m2-status" role="status">
          🤖 NOVA: {log}
        </div>
      )}
      <div className="m2-research">
        <strong>🔬 Astronaut Health Research · NASA OSDR</strong>
        <p>
          NASA OSDR hosts space-biology studies, including investigations of how
          spaceflight affects living systems. It does not establish the
          fictional power-unit or percentage thresholds in this game. NASA ECLSS
          describes the real spacecraft functions of oxygen generation, water
          recovery and CO₂ removal.
        </p>
        <a
          href="https://osdr.nasa.gov/bio/repo/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore NASA Open Science Data Repository ↗
        </a>
        {' · '}
        <a
          href="https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/"
          target="_blank"
          rel="noopener noreferrer"
        >
          NASA ECLSS engineering reference ↗
        </a>
      </div>
      <p className="m2-disclaimer">
        HISTORICAL FACTS vs SIMULATION: NASA event descriptions and links refer
        to real missions. Lunar-outpost conditions, percentages, cycle
        durations, power units, recommended reserve and CO₂ risk scores are
        fictional educational mechanics—not engineering or medical limits.
      </p>
    </div>
  );
}
