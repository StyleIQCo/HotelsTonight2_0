import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { getPerkBadges } from '../lib/pricing.js';
import PriceSparkline from './PriceSparkline.jsx';

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
  const { simulatedHour, pricingConfig, favorites, toggleFavorite, viewerCount, ratingSummaries } = useApp();
  const rating = ratingSummaries[hotel.id];
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
        {rating && (
          <div className="hotel-rating">
            <span style={{ color: '#ffb84d' }}>★</span>
            <span style={{ fontWeight: 700 }}>{rating.avg}</span>
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>({rating.count})</span>
          </div>
        )}

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

        <div className="card-sparkline-row">
          <span className="card-sparkline-label">Price today</span>
          <PriceSparkline hotel={hotel} width={90} height={26} />
        </div>

        <div className="scarcity-row">
          {roomsLeft != null && roomsLeft <= 8 && (
            <span className={`rooms-left ${roomsLeft <= 3 ? 'rooms-critical' : 'rooms-low'}`}>
              {roomsLeft <= 3 ? `⚠️ Only ${roomsLeft} room${roomsLeft === 1 ? '' : 's'} left!` : `${roomsLeft} rooms left`}
            </span>
          )}
          <span className="viewers">{viewers} people looking</span>
        </div>
        {hotel.latestCheckIn && (
          <div className="late-checkin-badge">
            🌙 Guaranteed until {hotel.latestCheckIn === '24 hours' ? '24 hrs' : hotel.latestCheckIn}
          </div>
        )}
      </div>
    </Link>
  );
}
