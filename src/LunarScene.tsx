import './App.css';

export type LocationId =
  | 'habitat'
  | 'shielding'
  | 'solar'
  | 'food'
  | 'communications';

type Props = {
  selected: LocationId | null;
  onSelect: (location: LocationId) => void;
  alert?: boolean;
};

const hotspots: {
  id: LocationId;
  label: string;
  left: string;
  top: string;
}[] = [
  { id: 'shielding', label: 'Radiation Shielding', left: '20%', top: '48%' },
  { id: 'communications', label: 'Communication · Mission 03', left: '54%', top: '43%' },
  { id: 'food', label: 'Food Production', left: '70%', top: '60%' },
  { id: 'habitat', label: 'Life Support', left: '43%', top: '58%' },
  { id: 'solar', label: 'Power Budgeting', left: '19%', top: '71%' },
];

export default function LunarScene({ selected, onSelect, alert = false }: Props) {
  return (
    <div className="lunar-scene nova-base-scene" aria-label="Interactive lunar outpost map">
      <div className="nova-base-image-frame">
        <img
          className="nova-base-image"
          src="https://i.postimg.cc/PqPnGNzR/lunar-outpost-watermarked.webp"
          alt="Realistic lunar base with habitats, solar panels, greenhouse, communications dish and astronauts"
        />
        {hotspots.map(({ id, label, left, top }) => (
          <button
            key={id}
            type="button"
            className={`nova-base-hotspot ${selected === id ? 'nova-base-hotspot-selected' : ''}`}
            style={{
              left,
              top,
              width: 28,
              height: 28,
              padding: 0,
              transform: 'translate(-50%, -50%)',
              border: '1px solid rgba(255, 245, 55, 0.85)',
              borderRadius: '50%',
              background: 'rgba(9, 20, 34, 0.25)',
              boxShadow: '0 0 9px rgba(241, 255, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => onSelect(id)}
            aria-label={`Explore ${label}`}
            aria-pressed={selected === id}
            title={`Explore ${label}`}
          >
            <span
              className="nova-hotspot-dot"
              aria-hidden="true"
              style={{
                display: 'block',
                width: 10,
                height: 10,
                minWidth: 10,
                minHeight: 10,
                borderRadius: '50%',
                background: '#eaff00',
                boxShadow: '0 0 9px #eaff00',
                border: 'none',
              }}
            />
            {id === 'communications' && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '24px',
                  top: '-18px',
                  whiteSpace: 'nowrap',
                  background: '#101b3c',
                  color: '#eaff00',
                  border: '1px solid #eaff00',
                  borderRadius: 5,
                  padding: '3px 6px',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '.03em',
                  pointerEvents: 'none',
                  boxShadow: '0 2px 8px #0009',
                }}
              >
                📡 MISSION 03
              </span>
            )}
          </button>
        ))}
      </div>
      <span className="nova-scene-hint">
        Select a glowing marker to inspect an outpost system
      </span>
      {alert && <span className="nova-scene-alert">● LIVE MISSION</span>}
    </div>
  );
}
