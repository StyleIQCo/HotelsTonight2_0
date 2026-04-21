import React from 'react';
import { wazeUrl, googleMapsUrl, appleMapsUrl } from '../lib/directions.js';

// Three compact "Drive with X" buttons. `variant="compact"` renders icon-only
// pills for the hotel cards; the default variant is full-width and labeled
// for the detail page.
export default function DirectionsButtons({ hotel, variant = 'default', onClick }) {
  const dest = { lat: hotel.lat, lng: hotel.lng };
  const opts = { label: hotel.name };
  const waze = wazeUrl(dest, opts);
  const google = googleMapsUrl(dest, opts);
  const apple = appleMapsUrl(dest, opts);

  function handleClick(e) {
    // Stop click from bubbling up when used inside a card link.
    e.stopPropagation();
    onClick?.();
  }

  if (variant === 'compact') {
    return (
      <div className="dir-row dir-row--compact" onClick={handleClick}>
        <a className="dir-btn" href={waze} target="_blank" rel="noreferrer" aria-label="Drive with Waze">
          <span className="dir-icon" aria-hidden="true">🚗</span>
          Drive
        </a>
      </div>
    );
  }

  return (
    <div className="dir-row" onClick={handleClick}>
      <a className="dir-btn dir-btn--waze" href={waze} target="_blank" rel="noreferrer">
        <span className="dir-icon" aria-hidden="true">🧭</span>
        Drive with Waze
      </a>
      <a className="dir-btn" href={google} target="_blank" rel="noreferrer">
        <span className="dir-icon" aria-hidden="true">🗺️</span>
        Google Maps
      </a>
      <a className="dir-btn" href={apple} target="_blank" rel="noreferrer">
        <span className="dir-icon" aria-hidden="true">🍎</span>
        Apple Maps
      </a>
    </div>
  );
}
