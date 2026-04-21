import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { getPerkBadges } from '../lib/pricing.js';

function priceTrendLabel(simulatedHour, primeTimeHour, cutoffHour) {
  if (simulatedHour >= cutoffHour) return { text: '★ Best rate tonight', cls: 'trend-best' };
  if (simulatedHour >= primeTimeHour) return { text: '↓ Price dropping', cls: 'trend-drop' };
  return { text: `Deals start at ${primeTimeHour}:00 PM`, cls: 'trend-soon' };
}

function getRoomsLeft(hotel) {
  if (!hotel.totalRooms) return null;
  return Math.max(1, Math.round(hotel.totalRooms * hotel.vacancyRate));
}

export default function HotelCard({ hotel, distanceMi }) {
  const { pricing } = hotel;
  const { simulatedHour, pricingConfig, favorites, toggleFavorite, viewerCount } = useApp();
  const isFav = favorites.has(hotel.id);
  const hasDiscount = pricing.totalPct > 0.01;
  const primaryReason = pricing.reasons[0];
  const badgeClass = primaryReason?.kind === 'late'
    ? 'badge badge-late'
    : primaryReason?.kind === 'vacancy'
      ? 'badge badge-vacant'
      : 'badge';

  const perks = getPerkBadges(hotel.amenities, 3);
  const roomsLeft = getRoomsLeft(hotel);
  const viewers = viewerCount(hotel.id);
  const trend = priceTrendLabel(simulatedHour, pricingConfig.primeTimeHour, pricingConfig.cutoffHour);

  function handleFav(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(hotel.id);
  }

  return (
    <Link to={`/hotel/${hotel.id}`} className="hotel-card" aria-label={`Book ${hotel.name}`}>
      <div className="hotel-img" style={{ backgroundImage: `url(${hotel.image})` }}>
        {hasDiscount && (
          <span className={badgeClass}>
            {Math.round(pricing.totalPct * 100)}% OFF
          </span>
        )}
        <button className="fav-btn" onClick={handleFav} aria-label={isFav ? 'Remove from saved' : 'Save hotel'}>
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="hotel-body">
        <div className="hotel-name">{hotel.name}</div>
        <div className="hotel-meta">
          <span className="stars">{'★'.repeat(hotel.stars)}</span>
          {' · '}{hotel.neighborhood}
          {distanceMi != null && ` · ${distanceMi.toFixed(1)} mi`}
        </div>

        {perks.length > 0 && (
          <div className="perk-row">
            {perks.map((p) => (
              <span key={p.label} className="perk">{p.emoji} {p.label}</span>
            ))}
          </div>
        )}

        <div className="price-row">
          {hasDiscount && <span className="price-old">${pricing.rack}</span>}
          <span className="price-new">${pricing.final}</span>
          <span className="per-night">/ night</span>
          <span className={`price-trend ${trend.cls}`}>{trend.text}</span>
        </div>

        <div className="scarcity-row">
          {roomsLeft != null && roomsLeft <= 8 && (
            <span className={`rooms-left ${roomsLeft <= 3 ? 'rooms-critical' : 'rooms-low'}`}>
              {roomsLeft <= 3 ? `⚠️ Only ${roomsLeft} room${roomsLeft === 1 ? '' : 's'} left!` : `${roomsLeft} rooms left`}
            </span>
          )}
          <span className="viewers">{viewers} people looking</span>
        </div>
      </div>
    </Link>
  );
}
