import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';

function timeAgo(isoStr) {
  const mins = Math.round((Date.now() - new Date(isoStr)) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function TransferCard({ tx }) {
  const nav = useNavigate();
  const { hotels } = useApp();
  const hotel = hotels.find((h) => h.id === tx.hotelId);
  const image = hotel?.image || tx.hotelImage;
  const savings = tx.originalPrice - tx.listPrice;
  const savingsPct = Math.round((savings / tx.originalPrice) * 100);

  return (
    <div className="exchange-card">
      <div
        className="exchange-card-img"
        style={{ backgroundImage: `url(${image})` }}
      >
        <span className="exchange-badge">🔄 Transfer</span>
        {savingsPct > 0 && (
          <span className="exchange-savings-badge">{savingsPct}% below original</span>
        )}
      </div>

      <div className="exchange-card-body">
        <div className="exchange-card-hotel">{tx.hotelName}</div>
        <div className="exchange-card-meta">{tx.neighborhood}</div>
        <div className="exchange-card-meta" style={{ marginTop: 4 }}>
          🛏 {tx.roomType} &nbsp;·&nbsp; ⏰ {tx.checkInTime}
        </div>

        {tx.sellerNote && (
          <div className="exchange-seller-note">
            <span className="exchange-seller-name">{tx.sellerName}:</span> "{tx.sellerNote}"
          </div>
        )}

        <div className="exchange-price-row">
          <div>
            {savings > 0 && (
              <div className="exchange-original-price">was ${tx.originalPrice}</div>
            )}
            <div className="exchange-list-price">${tx.listPrice}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>incl. taxes & fees</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {savings > 0 && (
              <div style={{ fontSize: 12, color: 'var(--good)', fontWeight: 700, marginBottom: 6 }}>
                Save ${savings}
              </div>
            )}
            <button
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: 14 }}
              onClick={() => nav(`/exchange/${tx.id}`)}
            >
              Claim booking →
            </button>
          </div>
        </div>

        <div className="exchange-footer">
          <span>Listed {timeAgo(tx.listedAt)}</span>
          <span>10% NightDrop fee included</span>
        </div>
      </div>
    </div>
  );
}

export default function BookingExchangePage() {
  const { transfers } = useApp();
  const [cityFilter, setCityFilter] = useState('all');

  const available = useMemo(
    () => transfers.filter((t) => t.status === 'available'),
    [transfers]
  );

  const cities = useMemo(() => {
    const seen = new Set();
    for (const t of available) {
      const city = t.neighborhood.split(',').pop().trim();
      seen.add(city);
    }
    return ['all', ...seen];
  }, [available]);

  const filtered = useMemo(() => {
    if (cityFilter === 'all') return available;
    return available.filter((t) => t.neighborhood.includes(cityFilter));
  }, [available, cityFilter]);

  return (
    <div style={{ maxWidth: 820, margin: '32px auto' }}>
      {/* Header */}
      <div className="exchange-header">
        <div>
          <h1 style={{ margin: 0 }}>🔄 NightDrop Exchange</h1>
          <p style={{ color: 'var(--muted)', margin: '6px 0 0', fontSize: 15 }}>
            Plans changed? Claim someone else's booking — often below NightDrop price.
          </p>
        </div>
        <Link to="/my-bookings" className="btn-ghost" style={{ flexShrink: 0, padding: '10px 18px' }}>
          My Bookings
        </Link>
      </div>

      {/* How it works */}
      <div className="exchange-how">
        <div className="exchange-how-step">
          <div className="exchange-how-icon">✈️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Someone's plans fell through</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Missed flight, emergency, change of plans</div>
          </div>
        </div>
        <div className="exchange-how-arrow">→</div>
        <div className="exchange-how-step">
          <div className="exchange-how-icon">🏷️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>They list their booking</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Often at a discount to move it fast</div>
          </div>
        </div>
        <div className="exchange-how-arrow">→</div>
        <div className="exchange-how-step">
          <div className="exchange-how-icon">🔑</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>You claim it instantly</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Booking transfers to your name</div>
          </div>
        </div>
      </div>

      {/* City filter */}
      {cities.length > 2 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {cities.map((c) => (
            <button
              key={c}
              className={`filter-chip${cityFilter === c ? ' active' : ''}`}
              onClick={() => setCityFilter(c)}
            >
              {c === 'all' ? `All cities (${available.length})` : c}
            </button>
          ))}
        </div>
      )}

      {/* Listings */}
      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No transfers available right now — check back soon or list your own.</p>
          <Link to="/my-bookings" className="btn-primary">View my bookings</Link>
        </div>
      )}

      <div className="exchange-grid">
        {filtered.map((tx) => (
          <TransferCard key={tx.id} tx={tx} />
        ))}
      </div>

      {/* Sell CTA */}
      <div className="exchange-sell-banner">
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Can't make it tonight?</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            List your booking on the Exchange and recoup some or all of what you paid.
          </div>
        </div>
        <Link to="/my-bookings" className="btn-primary" style={{ padding: '12px 20px', flexShrink: 0 }}>
          List a booking →
        </Link>
      </div>
    </div>
  );
}
