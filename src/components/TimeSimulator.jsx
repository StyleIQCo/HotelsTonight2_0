import React from 'react';
import { useApp } from '../store.jsx';

// A small panel that lets demo users fast-forward the clock so the late-check-in
// discount kicks in — helpful when you're showing off the product at noon.
export default function TimeSimulator() {
  const { simulatedHour, setSimulatedHour } = useApp();
  const label = (() => {
    const h = simulatedHour % 24;
    const ampm = h < 12 ? 'AM' : 'PM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}:00 ${ampm}`;
  })();
  return (
    <div
      className="detail-card"
      style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center' }}
    >
      <div style={{ flex: '0 0 auto' }}>
        <div style={{ fontWeight: 700 }}>Simulated clock</div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Slide to see how prices fall after prime-time.
        </div>
      </div>
      <input
        className="slider"
        type="range"
        min={0}
        max={23}
        value={simulatedHour}
        onChange={(e) => setSimulatedHour(Number(e.target.value))}
        aria-label="Simulated hour of day"
      />
      <div style={{ fontWeight: 700, minWidth: 90, textAlign: 'right' }}>{label}</div>
    </div>
  );
}
