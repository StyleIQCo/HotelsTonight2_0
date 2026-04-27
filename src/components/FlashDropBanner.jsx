import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store.jsx';

export default function FlashDropBanner() {
  const { flashDrops } = useApp();
  if (flashDrops.length === 0) return null;

  const drop = flashDrops[0];

  return (
    <div className="flash-drop-banner">
      <div className="flash-drop-inner">
        <div className="flash-drop-pulse" />
        <div style={{ flex: 1 }}>
          <span className="flash-drop-label">⚡ Flash Drop</span>
          <span style={{ fontWeight: 700 }}>{drop.hotelName}</span>
          {flashDrops.length > 1 && (
            <span style={{ color: 'rgba(0,0,0,0.6)', fontSize: 13 }}> +{flashDrops.length - 1} more</span>
          )}
          <span style={{ color: 'rgba(0,0,0,0.6)', fontSize: 13 }}>
            {' '}— extra 15% off for the next <strong>{drop.minutesLeft} min</strong>
          </span>
        </div>
        <Link to={`/hotel/${drop.hotelId}`} className="flash-drop-cta">
          ${drop.flashPrice} →
        </Link>
      </div>
    </div>
  );
}
