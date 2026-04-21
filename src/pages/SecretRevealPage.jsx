import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store.jsx';

const OFFER_SECS = 5 * 60; // 5-minute urgency timer

export default function SecretRevealPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { hotels } = useApp();
  const hotel = hotels.find((h) => h.id === id);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OFFER_SECS);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  if (!hotel) {
    return (
      <div className="empty-state">
        <p>Deal not found.</p>
        <Link to="/" className="btn-ghost">Back to tonight's deals</Link>
      </div>
    );
  }

  const discountPct = hotel.topSecretDiscount ?? hotel.pricing.totalPct;
  const price = Math.round(hotel.rackRate * (1 - discountPct));
  const savings = hotel.rackRate - price;
  const cityOnly = hotel.neighborhood.split(',').slice(-1)[0].trim();
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  if (expired) {
    return (
      <div className="secret-reveal-page">
        <div className="secret-reveal-card secret-expired">
          <div style={{ fontSize: 48 }}>⏰</div>
          <h2>This offer expired</h2>
          <p style={{ color: 'var(--muted)' }}>Check back — new Top Secret deals drop throughout the night.</p>
          <Link to="/" className="btn-primary" style={{ marginTop: 16, display: 'inline-block', padding: '14px 28px' }}>
            See tonight's deals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="secret-reveal-page">
      <div className="secret-reveal-card">
        {!revealed ? (
          <div className="secret-mystery">
            <div className="secret-lock-pulse">🔒</div>
            <div className="secret-reveal-stars">{'★'.repeat(hotel.stars)}</div>
            <div className="secret-reveal-city">{cityOnly}</div>
            <div className="secret-reveal-discount">{Math.round(discountPct * 100)}% OFF TONIGHT</div>
            <div className="secret-reveal-price">
              ${price}<span className="per-night"> / night</span>
            </div>
            <div className="secret-reveal-was">Regular price ${hotel.rackRate} — you save ${savings}</div>

            <div className="secret-reveal-timer" style={{ opacity: expired ? 0.5 : 1 }}>
              ⏳ Offer expires in <strong>{mins}:{secs}</strong>
            </div>

            <button
              className="btn-primary secret-reveal-btn"
              onClick={() => setRevealed(true)}
            >
              Tap to reveal your hotel
            </button>
            <Link to="/" className="secret-back">← Back to all deals</Link>
          </div>
        ) : (
          <div className="secret-revealed">
            <div
              className="secret-revealed-img"
              style={{ backgroundImage: `url(${hotel.image})` }}
            >
              <div className="secret-revealed-badge">
                {Math.round(discountPct * 100)}% OFF
              </div>
            </div>
            <div className="secret-revealed-body">
              <div className="secret-revealed-name">{hotel.name}</div>
              <div className="secret-revealed-location">
                <span className="stars">{'★'.repeat(hotel.stars)}</span>
                {' · '}{hotel.neighborhood}
              </div>
              <p style={{ color: 'var(--muted)', lineHeight: 1.5, margin: '8px 0 16px' }}>
                {hotel.tagline}
              </p>
              <div className="secret-reveal-price" style={{ marginBottom: 4 }}>
                ${price}<span className="per-night"> / night</span>
              </div>
              <div className="secret-reveal-was" style={{ marginBottom: 12 }}>
                was ${hotel.rackRate} — you save ${savings}
              </div>
              <div className="secret-reveal-timer">
                ⏳ Expires in <strong>{mins}:{secs}</strong>
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '15px', fontSize: 17, marginTop: 16 }}
                onClick={() => nav(`/checkout/${hotel.id}`)}
              >
                Book this deal — ${price}/night
              </button>
              <Link to="/" className="secret-back">← Back to all deals</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
