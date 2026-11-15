import { useEffect, useRef, useState } from 'react';
import LunarScene, { type LocationId } from './LunarScene';
import Mission02, { initialM2, type M2Resources } from './Mission02';
import Mission03, { initialM3, type M3Resources } from './Mission03';
import './App.css';

type Resources = {
  power: number;
  oxygen: number;
  safety: number;
};

type Impact = Partial<Resources>;

type Choice = {
  title: string;
  description: string;
  impact: Impact;
  consequence: string;
};

type Recovery = {
  question: string;
  answers: string[];
  correct: number;
  success: string;
  retry: string;
  impact: Impact;
};

// Curated historical NASA observations. The lunar crew situation is fictional.
const nasaEvidence = [
  {
    title: 'The Active Sun',
    characters: 'Flicker & Bloop',
    label: 'NASA DONKI · linked events',
    description:
      'NASA associated several solar flare and coronal mass ejection records from May 8–10, 2024 with this particle event.',
    insight:
      'A flare is a burst of electromagnetic radiation. A CME carries plasma and magnetic fields. Neither automatically tells us the radiation dose at the Moon.',
    source: 'https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30677/-1',
  },
  {
    title: 'The Particle Detector',
    characters: 'Zip & Zap',
    label: 'NASA DONKI · observed alert',
    description:
      'At 13:35 UTC on May 10, 2024, GOES detected >10 MeV proton flux above 10 pfu. NASA issued an automated alert at 13:46:58 UTC.',
    insight:
      'Energetic protons can pose radiation risks. This measurement was made near Earth; it does not measure the lunar crew’s dose.',
    source: 'https://ccmc.gsfc.nasa.gov/DONKI/events/30678/1/',
  },
  {
    title: 'Protect the Lunar Crew',
    characters: 'NOVA',
    label: 'MISSION SIMULATION · fictional scenario',
    description:
      'Your simulated astronauts are 20 minutes from a designated radiation shelter. Their rover has not been verified as a radiation shelter.',
    insight:
      'Mission controllers should use warnings, local monitoring, shelter capability and established procedures to manage uncertainty. The 20-minute travel time is invented for gameplay.',
    source: null,
  },
] as const;

// Original lightweight vector mascots, drawn in SVG; no external images or packages.
// Flicker = flare, Bloop = CME, Zip & Zap = energetic particles, NOVA = mission guide.
function EvidenceMascots({ kind }: { kind: number }) {
  // Academy portraits use one distinct mascot per character.
  if (kind === 3 || kind === 4)
    return (
      <svg className="nova-mascot-svg" viewBox="0 0 120 66" role="img"
        aria-label={kind === 3 ? 'Flicker the smiling yellow solar flare' : 'Bloop the smiling blue coronal mass ejection cloud'}>
        {kind === 3 ? (
          <g transform="translate(60 33)">
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d="M0 -23 Q-7 -33 0 -36 Q7 -33 0 -23"
                transform={`rotate(${i * 30})`} fill="#ffb32b" stroke="#ffdf62" strokeWidth="1" />
            ))}
            <circle r="23" fill="#ffdd51" stroke="#ff9b28" strokeWidth="2" />
            <circle cx="-8" cy="-3" r="2.5" fill="#56351f" />
            <circle cx="8" cy="-3" r="2.5" fill="#56351f" />
            <path d="M-8 7 Q0 15 8 7" stroke="#56351f" strokeWidth="2.5"
              fill="none" strokeLinecap="round" />
            <circle cx="-14" cy="5" r="4" fill="#ff9b76" opacity=".75" />
            <circle cx="14" cy="5" r="4" fill="#ff9b76" opacity=".75" />
          </g>
        ) : (
          <g transform="translate(60 33)">
            <path d="M-28 9 Q-37 -3 -23 -12 Q-25 -26 -8 -24 Q5 -36 18 -20 Q34 -22 32 -6 Q41 11 24 19 Q5 29 -17 20 Q-29 22 -28 9Z"
              fill="#64d9ef" stroke="#2789c7" strokeWidth="2.5" />
            <circle cx="-9" cy="-2" r="2.5" fill="#183b66" />
            <circle cx="10" cy="-2" r="2.5" fill="#183b66" />
            <path d="M-7 8 Q1 15 10 7" stroke="#183b66" strokeWidth="2.3"
              fill="none" strokeLinecap="round" />
            <circle cx="-17" cy="6" r="4" fill="#ffadbc" opacity=".8" />
            <circle cx="19" cy="6" r="4" fill="#ffadbc" opacity=".8" />
          </g>
        )}
      </svg>
    );
  if (kind === 0)
    return (
      <svg
        className="nova-mascot-svg"
        viewBox="0 0 120 66"
        role="img"
        aria-label="Flicker the sunny flare and Bloop the blue plasma cloud"
      >
        <g className="mascot-flicker" transform="translate(33 32)">
          {Array.from({ length: 10 }, (_, i) => (
            <path
              key={i}
              d="M0 -21 Q-6 -30 0 -34 Q6 -30 0 -21"
              transform={`rotate(${i * 36})`}
              fill="#ffb32b"
              stroke="#ffdf62"
              strokeWidth="1"
            />
          ))}
          <circle r="23" fill="#ffdd51" stroke="#ff9b28" strokeWidth="2" />
          <circle cx="-8" cy="-3" r="2.5" fill="#56351f" />
          <circle cx="8" cy="-3" r="2.5" fill="#56351f" />
          <path
            d="M-8 7 Q0 15 8 7"
            stroke="#56351f"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="-14" cy="5" r="4" fill="#ff9b76" opacity=".75" />
          <circle cx="14" cy="5" r="4" fill="#ff9b76" opacity=".75" />
        </g>
        <g className="mascot-bloop" transform="translate(88 34)">
          <path
            d="M-24 9 Q-32 -2 -20 -10 Q-21 -23 -7 -21 Q5 -32 16 -18 Q31 -19 28 -5 Q37 10 22 16 Q5 25 -14 18 Q-25 20 -24 9Z"
            fill="#64d9ef"
            stroke="#2789c7"
            strokeWidth="2.5"
          />
          <circle cx="-8" cy="-2" r="2.5" fill="#183b66" />
          <circle cx="9" cy="-2" r="2.5" fill="#183b66" />
          <path
            d="M-6 8 Q1 14 9 7"
            stroke="#183b66"
            strokeWidth="2.3"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="-16" cy="6" r="4" fill="#ffadbc" opacity=".8" />
          <circle cx="17" cy="6" r="4" fill="#ffadbc" opacity=".8" />
        </g>
      </svg>
    );
  if (kind === 1)
    return (
      <svg
        className="nova-mascot-svg"
        viewBox="0 0 120 66"
        role="img"
        aria-label="Zip and Zap the energetic particle twins"
      >
        <path
          d="M4 25 L18 20 M7 42 L18 40 M104 18 L116 12 M105 44 L116 49"
          stroke="#9be8ff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <g className="mascot-zip" transform="translate(37 33)">
          <path
            d="M0 -27 L7 -17 L20 -19 L18 -5 L27 3 L15 11 L12 25 L-2 19 L-16 24 L-18 10 L-28 1 L-17 -8 L-17 -21 L-5 -17Z"
            fill="#ffe35e"
            stroke="#ffab35"
            strokeWidth="2"
          />
          <circle cx="-8" cy="0" r="2.5" fill="#283655" />
          <circle cx="7" cy="0" r="2.5" fill="#283655" />
          <path
            d="M-7 9 Q0 15 8 8"
            fill="none"
            stroke="#283655"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        <g className="mascot-zap" transform="translate(85 33)">
          <path
            d="M0 -26 L9 -16 L21 -18 L17 -5 L27 5 L14 12 L10 25 L-3 18 L-17 23 L-18 9 L-27 -2 L-15 -9 L-13 -22 L-2 -17Z"
            fill="#77e4f9"
            stroke="#328de2"
            strokeWidth="2"
          />
          <circle cx="-8" cy="0" r="2.5" fill="#243758" />
          <circle cx="7" cy="0" r="2.5" fill="#243758" />
          <path
            d="M-7 8 Q0 14 8 8"
            fill="none"
            stroke="#243758"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    );
  return (
    <svg
      className="nova-mascot-svg"
      viewBox="0 0 120 66"
      role="img"
      aria-label="NOVA the mission guide with a protective shield"
    >
      <g transform="translate(38 32)">
        <rect
          x="-24"
          y="-19"
          width="48"
          height="39"
          rx="13"
          fill="#d9edff"
          stroke="#60b6ef"
          strokeWidth="3"
        />
        <rect x="-18" y="-11" width="36" height="22" rx="9" fill="#193b75" />
        <circle cx="-8" cy="-1" r="4" fill="#eafe07" />
        <circle cx="8" cy="-1" r="4" fill="#eafe07" />
        <path
          d="M-5 7 Q0 11 5 7"
          stroke="#8be3f8"
          strokeWidth="2"
          fill="none"
        />
        <path d="M0 -20 V-27" stroke="#9de2ff" strokeWidth="3" />
        <circle cx="0" cy="-30" r="4" fill="#eafe07" />
      </g>
      <g transform="translate(88 33)">
        <path
          d="M0 -27 L24 -17 V3 Q20 20 0 29 Q-20 20 -24 3 V-17Z"
          fill="#4ac7a6"
          stroke="#b8fff1"
          strokeWidth="2.5"
        />
        <path
          d="M-11 0 L-2 10 L14 -9"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

const initialResources: Resources = {
  power: 75,
  oxygen: 85,
  safety: 90,
};

const locations: Record<LocationId, { title: string; description: string }> = {
  habitat: {
    title: 'Life Support',
    description:
      'A pressurized habitat maintains breathable air and supports water recycling. Monitor oxygen and power reserves.',
  },
  shielding: {
    title: 'Radiation Shielding',
    description:
      'Protected shelter helps reduce exposure to hazardous energetic particles. Shielding effectiveness depends on material, thickness, and the radiation environment.',
  },
  solar: {
    title: 'Power Budgeting',
    description:
      'Solar arrays generate electricity, while storage and careful budgeting keep essential systems operating during low-light periods.',
  },
  food: {
    title: 'Food Production',
    description:
      'A controlled growing system could supplement stored food. Crops need water, nutrients, lighting, and carefully managed power.',
  },
  communications: {
    title: 'Communication',
    description:
      'A communications antenna links the outpost with Earth when geometry and equipment allow, supporting data, alerts, and mission coordination.',
  },
};

const choices: Choice[] = [
  {
    title: 'Recall the crew immediately',
    description:
      'Use rover power for a fast return. Suspend science operations.',
    impact: { power: -20, oxygen: -6, safety: 5 },
    consequence:
      'Your astronauts return to the radiation shelter. Science is interrupted and the rover uses valuable power, but the crew reaches protection.',
  },
  {
    title: 'Use the rover as temporary refuge',
    description: 'Pause work, assess the warning, and conserve travel power.',
    impact: { power: -8, oxygen: -10, safety: -8 },
    consequence:
      'The crew waits inside the rover. But this rover is not certified as a radiation shelter, so the crew could remain exposed.',
  },
  {
    title: 'Finish collecting the samples',
    description: 'Gain science progress, but delay the return to shelter.',
    impact: { power: -5, oxygen: -15, safety: -25 },
    consequence:
      'The crew completes its science work, but spends longer outside during a radiation warning. The warning is now escalating.',
  },
];

const recoveryChallenges: Recovery[] = [
  {
    question:
      "The crew is sheltered, but tomorrow's life-support systems need power. What's your plan?",
    answers: [
      'Check solar charging and reserve power for essential systems.',
      'Use the remaining power for optional science experiments.',
      'Turn off power monitoring to save time.',
    ],
    correct: 0,
    success:
      'Smart planning! You protected the crew and established a power conservation plan. Tomorrow will still require careful energy management.',
    retry: 'Think about which systems must keep working to support life.',
    impact: { power: 0 },
  },
  {
    question:
      'The rover is not verified as a radiation shelter. The warning is escalating. What now?',
    answers: [
      'Stay in the rover without checking the radiation warning.',
      'Follow the emergency return procedure to reach verified shelter.',
      'Continue collecting samples from inside the rover.',
    ],
    correct: 1,
    success:
      'Good recovery! Your crew reaches the shielded habitat. You used more power and oxygen, but reduced the risk of further exposure.',
    retry:
      'A rover is not automatically a radiation shelter. Your crew needs verified protection.',
    impact: { power: -12, oxygen: -5, safety: 8 },
  },
  {
    question:
      'The crew collected the samples, but the radiation warning is escalating. What is your next move?',
    answers: [
      'Return the crew to the shielded habitat immediately.',
      'Collect one final sample before returning.',
      'Remain in the rover without verifying its shielding.',
    ],
    correct: 0,
    success:
      'Good recovery, Commander! You changed your plan when the risk increased. The crew reaches shelter, reducing further exposure risk.',
    retry:
      'The samples are secured. Think about how to protect the crew from further radiation exposure.',
    impact: { power: -12, oxygen: -5, safety: 8 },
  },
];

const wisdom = {
  title: 'Protect the Crew, Protect the Mission',
  principle:
    'Good leaders examine evidence, weigh risks, make timely decisions and adapt. Crew safety takes priority over optional science activities.',
  science:
    'Solar energetic particles can create radiation hazards. Astronauts may need to stop surface work and move into appropriately shielded shelter when mission procedures require it.',
  question:
    'How can a commander protect the crew while preserving enough resources for the next mission?',
};

function applyImpact(current: Resources, impact: Impact): Resources {
  const updated = { ...current };

  (Object.keys(impact) as (keyof Resources)[]).forEach((key) => {
    updated[key] = Math.max(
      0,
      Math.min(100, updated[key] + (impact[key] ?? 0))
    );
  });

  return updated;
}

const academyCrew = [
  {
    name: 'Flicker',
    topic: 'Solar flare · FLR',
    icon: '☀️',
    role: 'Mission 01',
    dialogue:
      "I'm Flicker! Solar flares release sudden bursts of electromagnetic radiation. My light can reach Earth's vicinity in about eight minutes!",
    lesson:
      'Flare light and energetic particles are different; they do not necessarily arrive together.',
  },
  {
    name: 'Bloop',
    topic: 'Coronal mass ejection · CME',
    icon: '☁️',
    role: 'Mission 01',
    dialogue:
      "Bloop here! I'm a huge eruption of plasma and magnetic fields. My direction and speed matter when scientists track space weather!",
    lesson: 'A CME is moving material, not simply a flash of light.',
  },
  {
    name: 'Zip & Zap',
    topic: 'Solar energetic particles · SEP',
    icon: '⚡',
    role: 'Mission 01',
    dialogue:
      "Zip and Zap are our names. Zoom! We're energetic charged particles, including protons and electrons. Some can pose radiation risks to astronauts!",
    lesson:
      'A particle alert near Earth is evidence, not a measured radiation dose at the Moon.',
  },
  {
    name: 'Aurora',
    topic: 'Geomagnetic storm · GST',
    icon: '🌎',
    role: 'Future missions',
    dialogue:
      "hey hey hey, Aurora here! Solar disturbances can shake up Earth's magnetic environment and sometimes help create beautiful auroras!",
    lesson:
      'Geomagnetic storms affect Earth’s magnetic environment; they are not the same as a lunar surface radiation measurement.',
  },
  {
    name: 'Boomer',
    topic: 'Interplanetary shock · IPS',
    icon: '💥',
    role: 'Future missions',
    dialogue:
      "Boomer here and I Boom! I'm a shock moving through space. Shocks can help accelerate charged particles!",
    lesson:
      'Space-weather phenomena can interact, but each observation has its own meaning.',
  },
  {
    name: 'Ringo',
    topic: 'Radiation belt enhancement · RBE',
    icon: '🪐',
    role: 'Future missions',
    dialogue:
      "I'm Ringo! Earth's magnetic field traps particles in radiation belts, and their populations can change!",
    lesson:
      'Earth’s radiation belts are not a direct measurement of radiation on the Moon.',
  },
] as const;

type Speaker = 'NOVA' | (typeof academyCrew)[number]['name'];

const voiceProfiles: Record<
  Speaker,
  { pitch: number; rate: number; voiceIndex: number }
> = {
  NOVA: { pitch: 1.0, rate: 0.98, voiceIndex: 0 },
  Flicker: { pitch: 1.12, rate: 1.05, voiceIndex: 1 },
  Bloop: { pitch: 0.94, rate: 0.96, voiceIndex: 2 },
  'Zip & Zap': { pitch: 1.10, rate: 1.08, voiceIndex: 3 },
  Aurora: { pitch: 1.04, rate: 0.98, voiceIndex: 4 },
  Boomer: { pitch: 0.93, rate: 1.00, voiceIndex: 5 },
  Ringo: { pitch: 1.08, rate: 1.03, voiceIndex: 6 },
};

const introNarration = `Hello, future astronaut! I'm NOVA, your mission training assistant. Welcome to Lunar Outpost, a simulation of humanity's future home on the Moon. You've been invited to join our Junior Astronaut Training Academy. Your mission is to learn how to keep a lunar outpost safe, powered, and ready for exploration. Living on the Moon isn't easy. Every drop of water, every breath of oxygen, and every watt of electricity matters. You'll investigate solar storms, manage limited resources, and make decisions that could protect your crew. Real NASA missions inspire these challenges, but our lunar scenarios are simulations. Are you ready to think like an astronaut? Your training begins now.`;


// Each NOVA line has a stable filename derived from the exact spoken text.
// Place ElevenLabs recordings in public/nova-voice/ using the recording manifest.
function novaClipName(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `/nova-voice/nova-${(hash >>> 0).toString(16).padStart(8, '0')}.mp3`;
}

type Screen = 'intro' | 'outpost' | 'mission01' | 'mission02' | 'mission03';

function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [introPlaying, setIntroPlaying] = useState(false);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const novaAudioRef = useRef<HTMLAudioElement | null>(null);
  const narrationActiveRef = useRef(false);
  const speechRunRef = useRef(0);
  const [selected, setSelected] = useState<LocationId | null>(null);
  const [systemInfoOpen, setSystemInfoOpen] = useState(false);
  const [resources, setResources] = useState<Resources>(initialResources);
  const [started, setStarted] = useState(false);
  const [academyComplete, setAcademyComplete] = useState(false);
  const [academyViewed, setAcademyViewed] = useState<number[]>([]);
  const [academyActive, setAcademyActive] = useState<number | null>(null);
  const [academyRevisit, setAcademyRevisit] = useState(false);
  const [investigationComplete, setInvestigationComplete] = useState(false);
  const [reviewedEvidence, setReviewedEvidence] = useState<number[]>([]);
  const [activeEvidence, setActiveEvidence] = useState<number | null>(null);
  const [decisionIndex, setDecisionIndex] = useState<number | null>(null);
  const [recoveryAnswer, setRecoveryAnswer] = useState<number | null>(null);
  const [recoveryCompleted, setRecoveryCompleted] = useState(false);
  const [wisdomUnlocked, setWisdomUnlocked] = useState(false);
  const [showWisdom, setShowWisdom] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(10);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicEnabledRef = useRef(true);
  const [activeMission, setActiveMission] = useState<1 | 2 | 3>(1);
  const [mission02Resources, setMission02Resources] =
    useState<M2Resources>(initialM2);
  const [mission02Unlocked, setMission02Unlocked] = useState(false);
  const [mission02Run, setMission02Run] = useState(0);
  const [mission03Resources, setMission03Resources] = useState<M3Resources>(initialM3);
  const [mission03Unlocked, setMission03Unlocked] = useState(false);
  const [mission03Run, setMission03Run] = useState(0);

  const decision = decisionIndex !== null ? choices[decisionIndex] : null;

  const recovery =
    decisionIndex !== null ? recoveryChallenges[decisionIndex] : null;

  function stopNarration() {
    speechRunRef.current += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (introAudioRef.current) {
      introAudioRef.current.pause();
      introAudioRef.current.currentTime = 0;
    }
    if (novaAudioRef.current) {
      novaAudioRef.current.pause();
      novaAudioRef.current.currentTime = 0;
    }
    narrationActiveRef.current = false;
    syncMusicVolume(false);
    setIntroPlaying(false);
  }

  function syncMusicVolume(speaking: boolean) {
    if (musicRef.current) musicRef.current.volume = (speaking ? Math.min(musicVolume, 3) : musicVolume) / 100;
  }

  function speak(text: string, force = false, speaker: Speaker = 'NOVA') {
    if (!voiceEnabled && !force) return;
    stopNarration();
    const run = speechRunRef.current;

    // Use the same prerecorded ElevenLabs voice for NOVA everywhere.
    // Until a clip is uploaded, the existing browser voice remains a fallback.
    if (speaker === 'NOVA') {
      const audio = novaAudioRef.current;
      if (audio) {
        const url = novaClipName(text);
        void fetch(url, { method: 'HEAD' }).then((response) => {
          if (run !== speechRunRef.current) return;
          if (!response.ok || !response.headers.get('content-type')?.includes('audio')) {
            browserSpeak(); return;
          }
          audio.src = url;
          audio.currentTime = 0;
          audio.onended = () => {
            if (run === speechRunRef.current) { narrationActiveRef.current = false; syncMusicVolume(false); }
          };
          audio.onerror = () => { if (run === speechRunRef.current) browserSpeak(); };
          narrationActiveRef.current = true;
          syncMusicVolume(true);
          void audio.play().catch(() => { if (run === speechRunRef.current) browserSpeak(); });
        }).catch(() => { if (run === speechRunRef.current) browserSpeak(); });
        return;
      }
    }
    browserSpeak();

    function browserSpeak() {
      if (run !== speechRunRef.current || !('speechSynthesis' in window)) return;
    narrationActiveRef.current = true;
    syncMusicVolume(true);
    const utterance = new SpeechSynthesisUtterance(text);
    const profile = voiceProfiles[speaker];
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = 0.9;

    // Prefer a high-quality installed voice over the browser's default.
    // Availability depends on the operating system and browser.
    const englishVoices = window.speechSynthesis.getVoices().filter((voice) =>
      voice.lang.toLowerCase().startsWith('en')
    );
    const preferred = englishVoices.find((voice) =>
      /microsoft (aria|jenny|sonia).*natural/i.test(voice.name)
    ) ?? englishVoices.find((voice) =>
      /samantha|ava|allison|serena|google us english/i.test(voice.name)
    ) ?? englishVoices.find((voice) =>
      /natural|premium|enhanced/i.test(voice.name)
    );
    if (englishVoices.length) {
      utterance.voice = speaker === 'NOVA'
        ? (preferred ?? englishVoices.find((voice) => voice.localService) ?? englishVoices[0])
        : (englishVoices[profile.voiceIndex % englishVoices.length]);
    }

    utterance.onend = () => { if (run === speechRunRef.current) { narrationActiveRef.current = false; syncMusicVolume(false); setIntroPlaying(false); } };
    utterance.onerror = () => { if (run === speechRunRef.current) { narrationActiveRef.current = false; syncMusicVolume(false); setIntroPlaying(false); } };
    window.speechSynthesis.speak(utterance);
    }
  }

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Music is enabled by default. Browser autoplay rules require the first
  // user gesture before audible playback; the gesture starts at 0:14 instantly.
  // The audio element stays mounted when missions change.
  useEffect(() => {
    const audio = musicRef.current;
    if (!audio) return;
    audio.volume = 0.1;

    const seekPastIntro = () => {
      if (audio.currentTime < 14) audio.currentTime = 14;
    };
    const onPlaying = () => setMusicStarted(true);
    const onPause = () => setMusicStarted(false);
    const onError = () => {
      setMusicStarted(false);
      console.error('Mission NOVA music file error:', audio.error);
    };
    const startMusic = () => {
      if (!musicEnabledRef.current || !audio.paused) return;
      // Setting currentTime is supported before metadata loads in modern browsers.
      // The metadata listener also seeks, so the 14-second intro is never played.
      try { seekPastIntro(); } catch { /* seek once metadata is available */ }
      void audio.play().catch((error) => {
        setMusicStarted(false);
        console.warn('Mission NOVA music playback blocked:', error);
      });
    };
    const onEnded = () => {
      audio.currentTime = 14;
      if (musicEnabledRef.current) startMusic();
    };

    audio.addEventListener('loadedmetadata', seekPastIntro);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);
    document.addEventListener('pointerdown', startMusic);
    document.addEventListener('keydown', startMusic);
    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) seekPastIntro();

    return () => {
      audio.removeEventListener('loadedmetadata', seekPastIntro);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
      document.removeEventListener('pointerdown', startMusic);
      document.removeEventListener('keydown', startMusic);
    };
  }, []);

  function playIntro() {
    stopNarration();
    if (!voiceEnabled) setVoiceEnabled(true);
    const run = speechRunRef.current;
    const fallback = () => {
      if (run !== speechRunRef.current) return;
      speak(introNarration, true);
      setIntroPlaying(true);
    };
    const audio = introAudioRef.current;
    if (!audio) { fallback(); return; }
    // Use a premium prerecorded voice if /public/nova-intro.mp3 exists.
    // Otherwise avoid a missing-file audio request and use browser speech.
    void fetch('/nova-intro.mp3', { method: 'HEAD' })
      .then((response) => {
        if (run !== speechRunRef.current) return;
        if (!response.ok || !response.headers.get('content-type')?.includes('audio')) {
          fallback(); return;
        }
        narrationActiveRef.current = true;
        syncMusicVolume(true);
        audio.onended = () => { if (run === speechRunRef.current) { narrationActiveRef.current = false; syncMusicVolume(false); setIntroPlaying(false); } };
        audio.onerror = fallback;
        setIntroPlaying(true);
        void audio.play().catch(fallback);
      })
      .catch(fallback);
  }

  function openIntro() {
    stopNarration();
    setScreen('intro');
    setShowWisdom(false);
    setSystemInfoOpen(false);
    setSelected(null);
    setActiveMission(1);
    // Navigation is user initiated; browsers allow speech after this click.
    playIntro();
  }

  function toggleMusic() {
    const audio = musicRef.current;
    if (!audio) return;
    // Check actual playback, not the default enabled preference. The first
    // click on this button must START music, not turn it off.
    if (!audio.paused) {
      musicEnabledRef.current = false;
      setMusicEnabled(false);
      audio.pause();
      return;
    }
    musicEnabledRef.current = true;
    setMusicEnabled(true);
    try {
      if (audio.currentTime < 14) audio.currentTime = 14;
    } catch { /* metadata listener will seek */ }
    void audio.play().catch((error) => {
      setMusicStarted(false);
      console.warn('Mission NOVA music playback blocked:', error);
    });
  }

  function adjustMusicVolume(delta: number) {
    setMusicVolume((current) => {
      const next = Math.max(0, Math.min(100, current + delta));
      if (musicRef.current) musicRef.current.volume = (narrationActiveRef.current ? Math.min(next, 3) : next) / 100;
      return next;
    });
  }

  function toggleVoice() {
    if (voiceEnabled) {
      stopNarration();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
      if (screen === 'intro') playIntro();
      else speak('NOVA voice activated, Commander.', true);
    }
  }

  function meetCharacter(index: number) {
    setAcademyActive(index);
    setAcademyViewed((current) =>
      current.includes(index) ? current : [...current, index]
    );
    speak(
      academyCrew[index].dialogue + ' ' + academyCrew[index].lesson,
      false,
      academyCrew[index].name
    );
  }

  function finishAcademy() {
    if (academyViewed.length !== academyCrew.length) return;
    setScreen('mission01');
    setAcademyComplete(true);
    setAcademyRevisit(false);
    speak(
      'Commander, you do not need every answer. Look at the evidence, evaluate the risks, decide in time, and adapt when things change. Your training is complete!'
    );
  }

  function startMission() {
    setScreen('mission01');
    setStarted(true);
    setInvestigationComplete(false);
    setReviewedEvidence([]);
    setActiveEvidence(null);
    setSelected('habitat');
    setDecisionIndex(null);
    setRecoveryAnswer(null);
    setRecoveryCompleted(false);

    speak(
      'Commander, NASA detected energetic protons near Earth during a historical solar event. Investigate the evidence before deciding what our simulated lunar crew should do.'
    );
  }

  function inspectEvidence(index: number) {
    setActiveEvidence(index);
    setReviewedEvidence((current) =>
      current.includes(index) ? current : [...current, index]
    );
    speak(nasaEvidence[index].description + ' ' + nasaEvidence[index].insight);
  }

  function completeInvestigation() {
    if (reviewedEvidence.length !== nasaEvidence.length) return;
    setInvestigationComplete(true);
    speak(
      'Investigation complete, Commander. The NASA alert is real, but the lunar situation is a training simulation. Choose how to protect the crew.'
    );
  }

  function makeDecision(index: number) {
    if (decisionIndex !== null) return;

    const choice = choices[index];

    setResources((current) => applyImpact(current, choice.impact));

    setDecisionIndex(index);
    setRecoveryAnswer(null);
    setRecoveryCompleted(false);

    speak(choice.consequence + ' Commander, we have another decision to make.');
  }

  function answerRecovery(index: number) {
    if (!recovery || recoveryCompleted) return;

    setRecoveryAnswer(index);

    if (index === recovery.correct) {
      setRecoveryCompleted(true);
      setWisdomUnlocked(true);

      setResources((current) => applyImpact(current, recovery.impact));

      speak(recovery.success);
    } else {
      speak(recovery.retry);
    }
  }

  function openWisdom() {
    if (!wisdomUnlocked) return;

    setShowWisdom(true);
    speak(`${wisdom.title}. ${wisdom.principle} ${wisdom.science}`);
  }

  function closeWisdom() {
    setShowWisdom(false);
    stopNarration();
  }

  function beginMission02() {
    stopNarration();
    setScreen('mission02');
    setActiveMission(2);
    setMission02Resources({ ...initialM2 });
    setMission02Run((n) => n + 1);
    setShowWisdom(false);
    setSystemInfoOpen(false);
    setSelected(null);
    speak(
      'Mission two. Power Under Pressure. An electrical fault is draining our lunar outpost. We must protect breathable air, water and the crew. Here is some training for you. Investigate real NASA history to get some knowledge on how to manage the crisis.'
    );
  }

  function beginMission03() {
    stopNarration();
    setScreen('mission03');
    setActiveMission(3);
    setMission03Resources({ ...initialM3 });
    setMission03Run((n) => n + 1);
    setShowWisdom(false);
    setSystemInfoOpen(false);
    setSelected(null);
    speak('Mission three. The Last Signal. Our simulated lunar outpost has lost contact with Earth. Investigate NASA communication science, align the antenna, and protect your crew.');
  }

  function beginMission01() {
    stopNarration();
    setScreen('mission01');
    setActiveMission(1);
    setShowWisdom(false);
    setSystemInfoOpen(false);
    setSelected(null);
    setResources({ ...initialResources });
    setStarted(false);
    setInvestigationComplete(false);
    setReviewedEvidence([]);
    setActiveEvidence(null);
    setDecisionIndex(null);
    setRecoveryAnswer(null);
    setRecoveryCompleted(false);
    setAcademyActive(null);
    // Reintroduce Mission 01 while preserving earned achievements.
    setAcademyRevisit(true);
    speak(
      'Welcome to Mission One, Commander! Meet the Space Weather Crew, then investigate the NASA solar alert.'
    );
  }

  function returnToOutpost() {
    stopNarration();
    setScreen('outpost');
    setActiveMission(1);
    setShowWisdom(false);
    setSystemInfoOpen(false);
    setSelected(null);
    setAcademyRevisit(false);
    // Keep completed missions and Mission 01 progress intact.
  }

  function restart() {
    stopNarration();
    setResources({ ...initialResources });
    setSelected(null);
    setSystemInfoOpen(false);
    setStarted(false);
    setInvestigationComplete(false);
    setReviewedEvidence([]);
    setActiveEvidence(null);
    setDecisionIndex(null);
    setRecoveryAnswer(null);
    setRecoveryCompleted(false);
    setShowWisdom(false);
    setAcademyRevisit(false);
    // Keep Academy training and collected wisdom during this session.
  }

  return (
    <main className="control-app">
      <audio ref={introAudioRef} src="/nova-intro.mp3" preload="none" aria-label="NOVA introduction narration" />
      <audio ref={novaAudioRef} preload="none" aria-label="NOVA mission narration" />
      <audio
        ref={musicRef}
        src="/938160_Judgement-Orchestral-Dubst.mp3"
        preload="auto"
        aria-label="Mission NOVA background music"
      />
      <header className="control-header">
        <div>
          <span className="control-kicker">
            JUNIOR ASTRONAUT MISSION TRAINER
          </span>
          <h1>
            LUNAR <em>OUTPOST</em>
          </h1>
        </div>

        <div className="nova-header-actions">
          <button type="button" className={`voice-toggle ${screen === 'intro' ? 'nova-nav-active' : ''}`} onClick={openIntro} aria-current={screen === 'intro' ? 'page' : undefined}>✨ Intro</button>
          <button
            type="button"
            className="voice-toggle"
            onClick={toggleMusic}
            aria-pressed={musicEnabled}
            title={musicStarted ? 'Pause background music' : 'Play background music from 0:14'}
          >
            {musicStarted ? '🎵 Music On' : musicEnabled ? '🎵 Music Ready' : '🎵 Music Off'}
          </button>
          <div role="group" aria-label="Background music volume" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button type="button" className="voice-toggle" onClick={() => adjustMusicVolume(-10)}
              disabled={musicVolume === 0} aria-label="Decrease music volume" title="Decrease music volume"
              style={{ padding: '8px 10px' }}>−</button>
            <span aria-live="polite" aria-label={`Music volume ${musicVolume} percent`}
              style={{ color: '#eafe07', minWidth: 36, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
              {musicVolume}%
            </span>
            <button type="button" className="voice-toggle" onClick={() => adjustMusicVolume(10)}
              disabled={musicVolume === 100} aria-label="Increase music volume" title="Increase music volume"
              style={{ padding: '8px 10px' }}>+</button>
          </div>
          <button
            type="button"
            className="voice-toggle"
            onClick={returnToOutpost}
          >
            🏠 Outpost
          </button>
          <button
            type="button"
            className="voice-toggle"
            onClick={beginMission02}
          >
          ☀️ Mission 01
          </button>
          <button 
            type="button"
            className="voice-toggle"
            onClick={beginMission03}
            >
            ⚡ Mission 02
          </button>
          <button
            type="button"
            className="voice-toggle"
            onClick={beginMission01}
          >
     
          📡 Mission 03
          </button>
          {academyComplete && activeMission === 1 && (
            <button
              type="button"
              className="voice-toggle"
              onClick={() => setAcademyRevisit(true)}
            >
              🎓 Academy
            </button>
          )}
          <button
            className="voice-toggle"
            onClick={toggleVoice}
            aria-pressed={voiceEnabled}
          >
            {voiceEnabled ? '🔊 NOVA Voice On' : '🔇 NOVA Voice Off'}
          </button>
        </div>
      </header>

      <div className="control-layout">
        <div className="control-scene-panel">
          <LunarScene
            selected={selected}
            onSelect={(location) => {
              setSelected(location);
              setSystemInfoOpen(true);
              speak(locations[location].description);
            }}
            alert={started && !recoveryCompleted}
          />

          <div className="scene-nova-line">
            <strong>🤖 NOVA</strong>
            <span aria-live="polite">
              {screen === 'intro'
                ? 'Welcome, future astronaut! Meet NOVA and begin your lunar training.'
                : screen === 'outpost'
                ? 'Explore the lunar outpost, then choose your training mission.'
                : activeMission === 3
                ? mission03Unlocked
                  ? 'Mission 03 complete! Signal restored and crew protected.'
                  : 'Commander, align the antenna and restore contact with Earth.'
                : activeMission === 2
                ? mission02Unlocked
                  ? 'Mission 02 complete! Every watt counts.'
                  : 'Commander, protect the outpost power and life-support systems.'
                : recoveryCompleted
                ? 'Good recovery, Commander! Mission insight unlocked.'
                : decision
                ? 'Our situation has changed. What is your next move?'
                : started
                ? !investigationComplete
                  ? 'Commander, investigate the NASA evidence before making your decision.'
                  : 'Commander, the crew needs your help!'
                : selected
                ? locations[selected].description
                : 'Welcome, Commander! Explore your lunar outpost.'}
            </span>
          </div>
        </div>

        <section className="control-mission-panel">
          {screen === 'intro' ? (
            <div className="nova-intro">
              <span className="panel-kicker">MISSION CONTROL · INCOMING TRANSMISSION</span>
              <h2>Welcome, Future Astronaut!</h2>
              <p className="nova-intro-lead">I'm NOVA, your lunar mission training assistant.</p>
              <p>You're joining a simulated Junior Astronaut Training Academy. Your challenge: keep a lunar outpost safe, powered, and ready for exploration.</p>
              <p>Every breath of oxygen, drop of water, and watt of electricity counts. Investigate real NASA science, weigh your options, and protect your crew.</p>
              <p className="nova-intro-highlight">Think like an astronaut. Decide like a mission commander.</p>
              <div className="nova-intro-actions">
                <button className="control-secondary" type="button" onClick={introPlaying ? stopNarration : playIntro}>{introPlaying ? '■ Stop NOVA' : '▶ Hear NOVA'}</button>
                <button className="control-primary" type="button" onClick={returnToOutpost}>🚀 Begin Training</button>
              </div>
              <small className="nova-intro-note">Independent NASA-inspired educational simulation. Not official NASA astronaut recruitment.</small>
            </div>
          ) : screen === 'outpost' ? (
            <div className="nova-intro">
              <span className="panel-kicker">LUNAR OUTPOST · MISSION SELECT</span>
              <h2>Choose Your Training Mission</h2>
              <p>Explore the outpost systems on the left, or begin a mission whenever you're ready.</p>
              <button className="control-primary" type="button" onClick={beginMission01}>☀️ Mission 01 · Solar Alert</button>
              <button className="control-secondary" type="button" onClick={beginMission02}>⚡ Mission 02 · Power Under Pressure</button>
              <button className="control-secondary" type="button" onClick={beginMission03}>📡 Mission 03 · The Last Signal</button>
            </div>
          ) : screen === 'mission03' ? (
            <Mission03 key={mission03Run} onUpdate={setMission03Resources}
              onComplete={() => setMission03Unlocked(true)}
              onWisdom={() => setShowWisdom(true)}
              onRestart={beginMission03} onReturn={returnToOutpost}
              speak={(text) => speak(text)} />
          ) : screen === 'mission02' ? (
            <Mission02
              key={mission02Run}
              onUpdate={setMission02Resources}
              onComplete={() => setMission02Unlocked(true)}
              onWisdom={() => setShowWisdom(true)}
              onRestart={beginMission02}
              onReturn={returnToOutpost}
              speak={(text) => speak(text)}
            />
          ) : !academyComplete || academyRevisit ? (
            <div className="nova-academy">
              <span className="panel-kicker">
                SPACE WEATHER ACADEMY · PRE-MISSION TRAINING
              </span>
              <h2>Meet the Space Weather Crew</h2>
              <p className="academy-lead">
                Great space leaders aren't defined by knowing every answer.
                They're defined by how they decide when the answers aren't
                clear.
              </p>
              <div className="academy-code">
                Explore evidence · Evaluate risk · Decide in time · Adapt
              </div>
              <div className="academy-progress" aria-live="polite">
                Meet the crew: {academyViewed.length} / 6
              </div>
              <div className="academy-grid">
                {academyCrew.map((member, index) => (
                  <button
                    type="button"
                    key={member.name}
                    className={`academy-character ${
                      academyActive === index ? 'academy-character-active' : ''
                    }`}
                    onClick={() => meetCharacter(index)}
                    aria-pressed={academyActive === index}
                  >
                    <span className="academy-portrait" aria-hidden="true">
                      {index < 3 ? (
                        <EvidenceMascots kind={index === 2 ? 1 : index === 0 ? 3 : 4} />
                      ) : (
                        <span className="academy-emoji">{member.icon}</span>
                      )}
                    </span>
                    <strong>{member.name}</strong>
                    <small>{member.topic}</small>
                    <span className="academy-status">
                      {academyViewed.includes(index) ? '✓ Met' : 'Meet me'}
                    </span>
                  </button>
                ))}
              </div>
              {academyActive !== null && (
                <div className="academy-dialogue" aria-live="polite">
                  <strong>
                    🤖 NOVA introduces {academyCrew[academyActive].name}
                  </strong>
                  <p>“{academyCrew[academyActive].dialogue}”</p>
                  <small>
                    SCIENCE CLUE · {academyCrew[academyActive].lesson}
                  </small>
                </div>
              )}
              <div className="academy-actions">
                {academyRevisit && (
                  <button
                    className="control-secondary"
                    type="button"
                    onClick={() => setAcademyRevisit(false)}
                  >
                    ← Back to Mission
                  </button>
                )}
                {!academyComplete && (
                  <button
                    className="control-primary"
                    type="button"
                    disabled={academyViewed.length !== academyCrew.length}
                    onClick={finishAcademy}
                  >
                    {academyViewed.length === academyCrew.length
                      ? '🚀 Training Complete · Prepare Mission 01'
                      : '🔒 Meet All Six Characters'}
                  </button>
                )}
              </div>
            </div>
          ) : !started ? (
            <>
              <span className="panel-kicker">MISSION BRIEFING</span>

              <h2>Welcome, Commander!</h2>

              <p>
                Training complete! Your mission is to recognize the science,
                reason from NASA evidence, and make a timely decision to protect
                your crew.
              </p>

              {selected && (
                <div className="location-info">
                  <strong>{locations[selected].title}</strong>
                  <p>{locations[selected].description}</p>
                </div>
              )}

              <button className="control-primary" onClick={startMission}>
                🚀 Begin Mission 01
              </button>
              <button className="control-secondary" onClick={beginMission02}>
                ⚡ Begin Mission 02 · Power Under Pressure
              </button>
            </>
          ) : !investigationComplete ? (
            <>
              <span className="panel-kicker">MISSION 01 · NASA EVIDENCE</span>
              <h2>🔎 Investigate the Solar Alert</h2>
              <p>
                NOVA: “Commander, NASA detected energetic particles near Earth.
                What does that mean for our simulated lunar crew? Investigate
                all three clues.”
              </p>
              <div className="evidence-progress" aria-live="polite">
                Evidence reviewed: {reviewedEvidence.length} /{' '}
                {nasaEvidence.length}
              </div>
              <div className="evidence-grid">
                {nasaEvidence.map((evidence, index) => (
                  <button
                    type="button"
                    key={evidence.title}
                    className={`evidence-tile ${
                      activeEvidence === index ? 'evidence-tile-active' : ''
                    }`}
                    onClick={() => inspectEvidence(index)}
                    aria-pressed={activeEvidence === index}
                  >
                    <span className="evidence-icon" aria-hidden="true">
                      <EvidenceMascots kind={index} />
                    </span>
                    <strong>{evidence.title}</strong>
                    <span className="evidence-character-name">
                      {evidence.characters}
                    </span>
                    <small>
                      {reviewedEvidence.includes(index)
                        ? '✓ Investigated'
                        : 'Tap to investigate'}
                    </small>
                  </button>
                ))}
              </div>
              {activeEvidence !== null && (
                <div className="evidence-detail" aria-live="polite">
                  <span className="evidence-source-label">
                    {nasaEvidence[activeEvidence].label}
                  </span>
                  <h3>{nasaEvidence[activeEvidence].title}</h3>
                  <div className="evidence-character-intro">
                    <EvidenceMascots kind={activeEvidence} />
                    <span>Meet {nasaEvidence[activeEvidence].characters}</span>
                  </div>
                  <p>{nasaEvidence[activeEvidence].description}</p>
                  <p>
                    <strong>🤖 NOVA:</strong>{' '}
                    {nasaEvidence[activeEvidence].insight}
                  </p>
                  {nasaEvidence[activeEvidence].source && (
                    <a
                      href={nasaEvidence[activeEvidence].source}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View original NASA record ↗
                    </a>
                  )}
                </div>
              )}
              <button
                className="control-primary"
                onClick={completeInvestigation}
                disabled={reviewedEvidence.length !== nasaEvidence.length}
              >
                {reviewedEvidence.length === nasaEvidence.length
                  ? '🚀 Make Mission Decision'
                  : '🔒 Investigate All Three Clues'}
              </button>
            </>
          ) : !decision ? (
            <>
              <span className="panel-kicker">MISSION 01 · SOLAR ALERT</span>

              <h2>☀ 20 Minutes to Shelter</h2>

              <p>
                Commander, NASA detected energetic particles near Earth, but
                this alert does not measure radiation at our lunar outpost. In
                this training scenario, your crew is outside, twenty minutes
                from designated shelter. Evaluate the uncertainty and decide in
                time.
              </p>

              <div className="control-facts">
                <span>⏱ 20 min to shelter</span>
                <span>🔋 Limited rover power</span>
                <span>☀ Historical NASA SEP alert</span>
              </div>

              <h3 className="control-question">
                COMMANDER, WHAT'S YOUR DECISION?
              </h3>

              <div className="control-choices">
                {choices.map((choice, index) => (
                  <button
                    className="control-choice"
                    key={choice.title}
                    onClick={() => makeDecision(index)}
                  >
                    <strong>
                      {String.fromCharCode(65 + index)}. {choice.title}
                    </strong>
                    <span>{choice.description}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="panel-kicker">MISSION 01 · CONSEQUENCE</span>

              <h2>Your Decision Matters</h2>

              <p>{decision.consequence}</p>

              {recovery && (
                <div className="control-reflection">
                  <strong>🤖 NOVA · YOUR NEXT MOVE</strong>

                  <p>{recovery.question}</p>

                  <div className="control-choices">
                    {recovery.answers.map((answer, index) => (
                      <button
                        key={answer}
                        className="control-choice"
                        disabled={recoveryCompleted}
                        onClick={() => answerRecovery(index)}
                        style={{
                          borderColor:
                            recoveryAnswer === index
                              ? recoveryCompleted
                                ? '#eafe07'
                                : '#ff9b73'
                              : undefined,
                        }}
                      >
                        <strong>
                          {String.fromCharCode(65 + index)}. {answer}
                        </strong>
                      </button>
                    ))}
                  </div>

                  {recoveryAnswer !== null && (
                    <div
                      className={`recovery-feedback ${
                        recoveryCompleted
                          ? 'feedback-success'
                          : 'feedback-retry'
                      }`}
                      role="status"
                    >
                      <strong>
                        {recoveryCompleted
                          ? '★ GOOD RECOVERY!'
                          : '↻ TRY ANOTHER APPROACH'}
                      </strong>
                      <p>
                        {recoveryCompleted ? recovery.success : recovery.retry}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {recoveryCompleted && (
                <button className="control-primary" onClick={openWisdom}>
                  💡 Unlock Mission Wisdom
                </button>
              )}

              {recoveryCompleted && (
                <button className="control-primary" onClick={beginMission02}>
                  🚀 Continue to Mission 02 · Power Under Pressure
                </button>
              )}
              <button className="control-secondary" onClick={restart}>
                ↻ Try Another Decision
              </button>
            </>
          )}
        </section>
      </div>

      <section className="control-bottom">
        <div className="control-resources" aria-label="Mission resource levels">
          {(screen === 'mission03'
            ? (Object.keys(mission03Resources) as (keyof M3Resources)[])
            : screen === 'mission02'
            ? (Object.keys(mission02Resources) as (keyof M2Resources)[])
            : (Object.keys(resources) as (keyof Resources)[])
          ).map((key) => {
            const value =
              screen === 'mission03'
                ? mission03Resources[key as keyof M3Resources]
                : screen === 'mission02'
                ? mission02Resources[key as keyof M2Resources]
                : resources[key as keyof Resources];
            const label =
              key === 'safety'
                ? 'CREW SAFETY'
                : key === 'co2'
                ? 'CO₂ RISK'
                : key.toUpperCase();
            return (
              <div
                className={`control-resource control-resource-${key}`}
                key={key}
              >
                <span className="resource-name">{label}</span>
                <div className="resource-gauge-row">
                  <div
                    className="resource-tube"
                    role="progressbar"
                    aria-label={label}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={value}
                  >
                    <div
                      className="resource-liquid"
                      style={{ height: `${value}%` }}
                    />
                    <div className="resource-tube-gloss" aria-hidden="true" />
                  </div>
                  <strong className="resource-percent">{value}%</strong>
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="control-collection"
          disabled={screen === 'intro' || screen === 'outpost' || (screen === 'mission03' ? !mission03Unlocked : screen === 'mission02' ? !mission02Unlocked : !wisdomUnlocked)}
          onClick={screen === 'mission03' || screen === 'mission02' ? () => setShowWisdom(true) : openWisdom}
        >
          <span>★ MISSION WISDOM</span>
          <strong>{`${
            Number(wisdomUnlocked) + Number(mission02Unlocked) + Number(mission03Unlocked)
          } / 7`}</strong>
          <small>
            {(screen === 'mission03' ? mission03Unlocked : screen === 'mission02' ? mission02Unlocked : wisdomUnlocked)
              ? 'View your collected insight'
              : 'Complete a recovery to unlock'}
          </small>
        </button>
      </section>

      <footer className="control-footer">
        Independent educational prototype for NASA Space Apps. NASA observations
        are historical; lunar conditions, resource values and risk scores are
        illustrative, not flight or radiation calculations.
        {' '}Music: “Judgement” by HJfod —{' '}
        <a href="https://www.newgrounds.com/audio/listen/938160" target="_blank" rel="noopener noreferrer">
          Newgrounds
        </a>.
      </footer>

      {systemInfoOpen && selected && (
        <div
          className="wisdom-overlay"
          onClick={() => setSystemInfoOpen(false)}
        >
          <div
            className="wisdom-modal nova-system-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="system-info-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="wisdom-close"
              aria-label="Close system information"
              onClick={() => setSystemInfoOpen(false)}
            >
              ✕
            </button>
            <span className="panel-kicker">LUNAR OUTPOST · SYSTEM STATUS</span>
            <h2 id="system-info-title">{locations[selected].title}</h2>
            <p>{locations[selected].description}</p>
            <div className="nova-system-status">
              <strong>Current mission resources</strong>
              <p>
                ⚡ Power{' '}
                {activeMission === 2
                  ? mission02Resources.power
                  : resources.power}
                % · 🫧 Oxygen{' '}
                {activeMission === 2
                  ? mission02Resources.oxygen
                  : resources.oxygen}
                % · 🛡 Crew safety{' '}
                {activeMission === 2
                  ? mission02Resources.safety
                  : resources.safety}
                %
              </p>
            </div>
            <p className="nova-system-note">
              These are simulated mission values. Exploring a system does not
              spend resources or interrupt your challenge.
            </p>
            {(selected === 'solar' || selected === 'habitat') && (
              <div className="nova-system-training">
                <strong>⚡ MISSION 02 · POWER UNDER PRESSURE</strong>
                <p>
                  Learn from the real Apollo 13 emergency, then manage power,
                  oxygen, water and CO₂ in a fictional lunar outpost.
                </p>
                <button className="control-primary" onClick={beginMission02}>
                  🚀 Start Mission 02 Training
                </button>
              </div>
            )}
            {selected === 'shielding' && (
              <button className="control-primary" onClick={beginMission01}>
                ☀️ Go to Mission 01
              </button>
            )}
            {selected === 'communications' && (
              <div className="nova-system-training">
                <strong>📡 MISSION 03 · THE LAST SIGNAL</strong>
                <p>
                  Restore contact with Earth. Investigate NASA communications,
                  align the antenna, and prioritize critical crew messages.
                </p>
                <button className="control-primary" onClick={beginMission03}>
                  🚀 Start Mission 03 Training
                </button>
              </div>
            )}
            <button
              className="control-primary"
              onClick={() => setSystemInfoOpen(false)}
            >
              Return to Mission
            </button>
          </div>
        </div>
      )}

      {screen !== 'intro' && showWisdom && (
        <div className="wisdom-overlay" onClick={closeWisdom}>
          <div
            className="wisdom-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wisdom-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="wisdom-close"
              aria-label="Close wisdom card"
              onClick={closeWisdom}
            >
              ✕
            </button>

            <span className="panel-kicker">
              ★ NOVA'S MISSION WISDOM · CARD {activeMission === 3 ? '03' : activeMission === 2 ? '02' : '01'}
            </span>

            <div className="wisdom-modal-icon">💡</div>

            <h2 id="wisdom-title">
              {activeMission === 3 ? 'Stay Connected, Stay Prepared' : activeMission === 2 ? 'Every Watt Counts' : wisdom.title}
            </h2>

            <h3>THE BIG IDEA</h3>
            <p>
              {activeMission === 3
                ? 'Investigate the signal, test antenna alignment, protect life support and send urgent messages first.'
                : activeMission === 2
                ? 'Power, water, oxygen and air revitalization are interconnected. Prioritize critical systems and adapt when conditions change.'
                : wisdom.principle}
            </p>

            <h3>THE SCIENCE BEHIND IT</h3>
            <p>
              {activeMission === 3
                ? 'Radio signals take roughly 1.3 seconds to travel between Earth and Moon one-way. Antenna pointing, line of sight, power and relays all matter.'
                : activeMission === 2
                ? 'Oxygen availability alone does not guarantee breathable air: carbon dioxide must also be removed. NASA Apollo 13 showed why power, consumables and CO₂ control matter.'
                : wisdom.science}
            </p>

            <h3>THINK LIKE A MISSION COMMANDER</h3>
            <p>
              {activeMission === 3
                ? 'If only one short message can get through, what should Mission Control know first?'
                : activeMission === 2
                ? 'Which essential system would you protect first if stored power suddenly dropped?'
                : wisdom.question}
            </p>

            <div className="wisdom-modal-unlocked">
              ★ SPACE SURVIVAL INSIGHT UNLOCKED
            </div>

            {activeMission === 1 && recoveryCompleted && (
              <button className="control-primary" onClick={beginMission02}>
                🚀 Begin Mission 02
              </button>
            )}
            {activeMission === 2 && (
              <a
                href="https://www.nasa.gov/missions/apollo/apollo-13-mission-details/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#eafe07' }}
              >
                Read the real Apollo 13 story at NASA ↗
              </a>
            )}
            <button className="control-primary" onClick={closeWisdom}>
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
