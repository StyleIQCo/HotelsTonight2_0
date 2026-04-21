import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store.jsx';
import DirectionsButtons from '../components/DirectionsButtons.jsx';
import HotelMap from '../components/HotelMap.jsx';
import { getPerkBadges } from '../lib/pricing.js';

export default function HotelDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { hotels, userLocation, favorites, toggleFavorite } = useApp();
  const hotel = hotels.find((h) => h.id === id);

  if (!hotel) {
    return (
      <div className="empty-state">
        <p>We couldn't find that hotel.</p>
        <Link to="/" className="btn-ghost">Back to tonight's deals</Link>
      </div>
    );
  }

  const { pricing } = hotel;
  const tax = Math.round(pricing.final * 0.14);
  const total = pricing.final + tax;
  const isFav = favorites.has(hotel.id);
  const perks = getPerkBadges(hotel.amenities, 6);

  return (
    <>
      <div className="detail-hero" style={{ backgroundImage: `url(${hotel.image})` }}>
        <button
          className="detail-fav-btn"
          onClick={() => toggleFavorite(hotel.id)}
          aria-label={isFav ? 'Remove from saved' : 'Save hotel'}
        >
          {isFav ? '❤️ Saved' : '🤍 Save'}
        </button>
      </div>

      <div className="detail-grid">
        <div>
          <h1 style={{ marginBottom: 6 }}>{hotel.name}</h1>
          <div style={{ color: 'var(--muted)', marginBottom: 16 }}>
            <span className="stars">{'★'.repeat(hotel.stars)}</span>
            {' · '}{hotel.neighborhood}
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.5 }}>{hotel.tagline}</p>

          {perks.length > 0 && (
            <div className="perk-row" style={{ marginTop: 12, marginBottom: 4 }}>
              {perks.map((p) => (
                <span key={p.label} className="perk perk-lg">{p.emoji} {p.label}</span>
              ))}
            </div>
          )}

          <div className="detail-card" style={{ marginTop: 18 }}>
            <h3 style={{ marginTop: 0 }}>Amenities</h3>
            <div className="amenity-list">
              {hotel.amenities.map((a) => (
                <span key={a} className="amenity">{a}</span>
              ))}
            </div>
          </div>

          <div className="detail-card" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Getting there</h3>
            <p style={{ color: 'var(--muted)', marginTop: 0 }}>{hotel.neighborhood}</p>
            <HotelMap hotels={[hotel]} userLocation={userLocation} height={240} />
            <DirectionsButtons hotel={hotel} />
          </div>

          <div className="detail-card" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Why tonight is a deal</h3>
            {pricing.reasons.length === 0 && (
              <p style={{ color: 'var(--muted)' }}>
                This hotel is at rack rate right now — check back after 6 PM when discounts kick in.
              </p>
            )}
            {pricing.reasons.map((r) => (
              <div key={r.kind} className="checkout-summary">
                <span>{r.label}</span>
                <span style={{ color: 'var(--good)', fontWeight: 700 }}>
                  −{Math.round(r.pct * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div className="detail-card">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              {pricing.totalPct > 0.01 && (
                <span className="price-old">${pricing.rack}</span>
              )}
              <span className="price-new">${pricing.final}</span>
              <span className="per-night">/ night</span>
            </div>
            {pricing.totalPct > 0.01 && (
              <div style={{ color: 'var(--good)', fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                You save ${pricing.rack - pricing.final} tonight
              </div>
            )}
            <div className="checkout-summary" style={{ marginTop: 16 }}>
              <span>1 night</span>
              <span>${pricing.final}</span>
            </div>
            <div className="checkout-summary">
              <span>Taxes &amp; fees (14%)</span>
              <span>${tax}</span>
            </div>
            <div className="checkout-summary">
              <span>Total due tonight</span>
              <span>${total}</span>
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: 16, width: '100%', padding: '14px' }}
              onClick={() => nav(`/checkout/${hotel.id}`)}
            >
              Book tonight
            </button>
            <div className="cancel-policy">
              ✅ Free cancellation until 6:00 PM local time
            </div>
            <div className="cancel-policy" style={{ marginTop: 6 }}>
              🔒 Secure checkout · No hidden fees
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky booking bar — shown only on small screens via CSS */}
      <div className="sticky-book-bar">
        <div>
          {pricing.totalPct > 0.01 && (
            <span className="price-old" style={{ fontSize: 13 }}>${pricing.rack}</span>
          )}
          <span className="price-new" style={{ fontSize: 20, marginLeft: pricing.totalPct > 0.01 ? 6 : 0 }}>
            ${pricing.final}
          </span>
          <span className="per-night"> /night</span>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '12px 24px', flexShrink: 0 }}
          onClick={() => nav(`/checkout/${hotel.id}`)}
        >
          Book tonight
        </button>
      </div>
    </>
  );
}
