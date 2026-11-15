import { useEffect, useRef, useState } from 'react';
import LunarScene, { type LocationId } from './LunarScene';
import Mission02, { initialM2, type M2Resources } from './Mission02';
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
