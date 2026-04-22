import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store.jsx';
import DirectionsButtons from '../components/DirectionsButtons.jsx';
import HotelMap from '../components/HotelMap.jsx';
import MarketIntelPanel from '../components/MarketIntelPanel.jsx';
import PriceSparkline from '../components/PriceSparkline.jsx';
import { getPerkBadges, makeRoomTypes } from '../lib/pricing.js';

function ReviewsSection({ hotelId }) {
  const { reviews, ratingSummaries } = useApp();
  const hotelReviews = reviews.filter((r) => r.hotelId === hotelId);
  const summary = ratingSummaries[hotelId];
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? hotelReviews : hotelReviews.slice(0, 3);

  if (hotelReviews.length === 0) return null;

  return (
    <div className="detail-card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Guest reviews</h3>
        {summary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#ffb84d', fontSize: 18 }}>★</span>
            <span style={{ fontWeight: 800, fontSize: 16 }}>{summary.avg}</span>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>({summary.count} reviews)</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displayed.map((r) => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.authorName}</div>
                {r.authorCity && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.authorCity}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#ffb84d', letterSpacing: 1 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {r.stayType && `${r.stayType} · `}{r.date}
                </div>
              </div>
            </div>
            <p className="review-text">{r.text}</p>
          </div>
        ))}
      </div>
      {hotelReviews.length > 3 && (
        <button
          className="btn-ghost"
          style={{ marginTop: 14, width: '100%' }}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? 'Show fewer reviews' : `Show all ${hotelReviews.length} reviews`}
        </button>
      )}
    </div>
  );
}

function PriceAlertButton({ hotel, pricing }) {
  const { priceAlerts, addPriceAlert, removePriceAlert } = useApp();
  const existing = priceAlerts.find((a) => a.hotelId === hotel.id);
  const [showForm, setShowForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState(Math.round(pricing.final * 0.85));

  if (existing) {
    return (
      <div className="price-alert-active">
        <span>🎯 Alert set: notify me when ≤ ${existing.targetPrice}/night</span>
        <button
          onClick={() => removePriceAlert(hotel.id)}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: 0 }}
        >
          Remove
        </button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="price-alert-form">
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Alert me when price drops to:</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontWeight: 600 }}>$</span>
          <input
            type="number"
            className="input"
            style={{ width: 80, padding: '8px 10px' }}
            value={targetPrice}
            min={50}
            max={pricing.rack}
            onChange={(e) => setTargetPrice(+e.target.value)}
          />
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>/night</span>
          <button
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: 13 }}
            onClick={() => { addPriceAlert(hotel.id, targetPrice); setShowForm(false); }}
          >
            Set alert
          </button>
          <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }} onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      className="btn-ghost"
      style={{ fontSize: 13, padding: '8px 14px', width: '100%', marginTop: 10 }}
      onClick={() => setShowForm(true)}
    >
      🎯 Notify me when price drops
    </button>
  );
}

function PhotoGallery({ images, name }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="gallery">
      <div
        className="gallery-main"
        style={{ backgroundImage: `url(${images[idx]})` }}
        role="img"
        aria-label={`${name} photo ${idx + 1} of ${images.length}`}
      />
      <button className="gallery-arrow gallery-prev" onClick={prev} aria-label="Previous photo">‹</button>
      <button className="gallery-arrow gallery-next" onClick={next} aria-label="Next photo">›</button>
      <div className="gallery-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`gallery-dot${i === idx ? ' active' : ''}`}
            onClick={() => setIdx(i)}
            aria-label={`Photo ${i + 1}`}
          />
        ))}
      </div>
      <div className="gallery-count">{idx + 1} / {images.length}</div>
    </div>
  );
}

function RoomTypePicker({ roomTypes, selected, pricing, onChange }) {
  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Choose your room</h3>
      <div className="room-type-grid">
        {roomTypes.map((rt) => {
          const adjustedFinal = Math.round(pricing.final * rt.multiplier);
          const isSelected = selected === rt.id;
          return (
            <button
              key={rt.id}
              className={`room-type-card${isSelected ? ' selected' : ''}`}
              onClick={() => onChange(rt.id)}
            >
              <div className="room-type-name">{rt.name}</div>
              <div className="room-type-detail">{rt.beds}</div>
              <div className="room-type-detail">{rt.sqft.toLocaleString()} sq ft · up to {rt.maxGuests} guests</div>
              <div className="room-type-desc">{rt.description}</div>
              <div className="room-type-price">${adjustedFinal}<span style={{ fontSize: 12, color: 'var(--muted)' }}>/night</span></div>
              {rt.multiplier > 1 && (
                <div className="room-type-mult">+{Math.round((rt.multiplier - 1) * 100)}% vs standard</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function HotelDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { hotels, userLocation, favorites, toggleFavorite, bookingDate } = useApp();
  const hotel = hotels.find((h) => h.id === id);

  const [selectedRoom, setSelectedRoom] = useState('standard');

  if (!hotel) {
    return (
      <div className="empty-state">
        <p>We couldn't find that hotel.</p>
        <Link to="/" className="btn-ghost">Back to tonight's deals</Link>
      </div>
    );
  }

  const { pricing } = hotel;
  const roomTypes = makeRoomTypes(hotel);
  const roomType = roomTypes.find((r) => r.id === selectedRoom) || roomTypes[0];
  const adjustedFinal = Math.round(pricing.final * roomType.multiplier);
  const adjustedRack = Math.round(pricing.rack * roomType.multiplier);
  const tax = Math.round(adjustedFinal * 0.14);
  const total = adjustedFinal + tax;
  const isFav = favorites.has(hotel.id);
  const perks = getPerkBadges(hotel.amenities, 6);

  // Build gallery: use hotel.gallery if present, else fall back to main image only
  const galleryImages = hotel.gallery?.length ? hotel.gallery : [hotel.image];

  function handleBook() {
    nav(`/checkout/${hotel.id}?room=${selectedRoom}`);
  }

  return (
    <>
      {/* Photo gallery replaces the single hero image */}
      <div style={{ position: 'relative' }}>
        <PhotoGallery images={galleryImages} name={hotel.name} />
        <button
          className="detail-fav-btn"
          onClick={() => toggleFavorite(hotel.id)}
          aria-label={isFav ? 'Remove from saved' : 'Save hotel'}
        >
          {isFav ? '❤️ Saved' : '🤍 Save'}
        </button>
      </div>

      {bookingDate === 'tomorrow' && (
        <div
          style={{
            background: 'rgba(255,184,77,0.12)',
            border: '1px solid rgba(255,184,77,0.3)',
            borderRadius: 10,
            padding: '10px 16px',
            fontSize: 13,
            color: 'var(--warn)',
            margin: '12px 0 0',
          }}
        >
          ☀️ Showing <strong>tomorrow's</strong> rate — vacancy discounts applied, late-arrival savings excluded.
        </div>
      )}

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

          {/* Price sparkline */}
          <div style={{ marginTop: 16, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Tonight's price curve</span>
            <PriceSparkline hotel={hotel} width={160} height={40} showLabel />
          </div>

          {/* Room type picker */}
          <div className="detail-card" style={{ marginTop: 18 }}>
            <RoomTypePicker
              roomTypes={roomTypes}
              selected={selectedRoom}
              pricing={pricing}
              onChange={setSelectedRoom}
            />
          </div>

          <div className="detail-card" style={{ marginTop: 16 }}>
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

          {/* Guest reviews */}
          <ReviewsSection hotelId={hotel.id} />

          {/* Market Intelligence */}
          <div style={{ marginTop: 16 }}>
            <MarketIntelPanel hotel={hotel} />
          </div>
        </div>

        <aside>
          <div className="detail-card">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              {pricing.totalPct > 0.01 && (
                <span className="price-old">${adjustedRack}</span>
              )}
              <span className="price-new">${adjustedFinal}</span>
              <span className="per-night">/ night</span>
            </div>
            {pricing.totalPct > 0.01 && (
              <div style={{ color: 'var(--good)', fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                You save ${adjustedRack - adjustedFinal} — {roomType.name}
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              {roomType.beds} · {roomType.sqft.toLocaleString()} sq ft
            </div>
            <div className="checkout-summary" style={{ marginTop: 16 }}>
              <span>1 night · {roomType.name}</span>
              <span>${adjustedFinal}</span>
            </div>
            <div className="checkout-summary">
              <span>Taxes &amp; fees (14%)</span>
              <span>${tax}</span>
            </div>
            <div className="checkout-summary">
              <span>Total due {bookingDate}</span>
              <span>${total}</span>
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: 16, width: '100%', padding: '14px' }}
              onClick={handleBook}
            >
              Book {bookingDate} — ${total}
            </button>
            <PriceAlertButton hotel={hotel} pricing={pricing} />
            <div className="cancel-policy" style={{ marginTop: 10 }}>
              ✅ Free cancellation until 6:00 PM local time
            </div>
            <div className="cancel-policy" style={{ marginTop: 6 }}>
              🔒 Secure checkout · No hidden fees
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky bar */}
      <div className="sticky-book-bar">
        <div>
          {pricing.totalPct > 0.01 && (
            <span className="price-old" style={{ fontSize: 13 }}>${adjustedRack}</span>
          )}
          <span className="price-new" style={{ fontSize: 20, marginLeft: pricing.totalPct > 0.01 ? 6 : 0 }}>
            ${adjustedFinal}
          </span>
          <span className="per-night"> /night · {roomType.name}</span>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '12px 24px', flexShrink: 0 }}
          onClick={handleBook}
        >
          Book {bookingDate}
        </button>
      </div>
    </>
  );
}
