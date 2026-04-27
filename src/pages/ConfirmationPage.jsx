import React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { TIERS } from '../lib/loyalty.js';

const CHECK_IN_INSTRUCTIONS = {
  default: [
    'Show your confirmation email at the front desk.',
    'Photo ID required at check-in.',
    'Room keys will be provided on arrival.',
  ],
};

function DirectionsLink({ hotel }) {
  if (!hotel?.lat || !hotel?.lng) return null;
  const url = `https://maps.google.com/?q=${hotel.lat},${hotel.lng}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: 13, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      📍 Get directions
    </a>
  );
}

export default function ConfirmationPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const { bookings, hotels, credits, tier } = useApp();

  const booking = state?.booking || bookings.find((b) => b.id === id);
  const hotel = state?.hotel || hotels.find((h) => h.id === booking?.hotelId);

  if (!booking || !hotel) {
    return (
      <div className="empty-state">
        <p>We couldn't find that booking.</p>
        <Link to="/" className="btn-ghost">Back home</Link>
      </div>
    );
  }

  const creditsEarned = booking.creditsEarned || Math.round(booking.priceUSD * 0.05);
  const tierInfo = TIERS[tier];
  const instructions = hotel.checkInInstructions || CHECK_IN_INSTRUCTIONS.default;

  return (
    <div style={{ maxWidth: 600, margin: '36px auto' }}>
      {/* Hero confirmation */}
      <div className="detail-card" style={{ textAlign: 'center', padding: '32px 28px', marginBottom: 14 }}>
        <div style={{ fontSize: 52 }}>🔑</div>
        <h1 style={{ margin: '12px 0 6px' }}>You're booked!</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          Confirmation <code>{booking.id}</code> · {booking.guestEmail}
        </p>

        {/* Credits earned */}
        <div style={{ background: 'rgba(255,184,77,0.12)', border: '1px solid rgba(255,184,77,0.28)', borderRadius: 12, padding: '12px 16px', margin: '18px 0 0', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
          <span style={{ fontSize: 28 }}>⭐</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--warn)' }}>+{creditsEarned} NightDrop Credits earned</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Balance: {credits.toLocaleString()} credits · {tierInfo.emoji} {tierInfo.label} member earns {Math.round(tierInfo.creditsRate * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Hotel + booking details */}
      <div className="detail-card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 80, height: 80, borderRadius: 10, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${hotel.image})`, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{hotel.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>{hotel.neighborhood}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              {booking.roomType || 'Standard Room'} · {booking.checkInTime || 'Standard check-in (3 PM)'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Guest: {booking.guestName}</div>
          </div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--good)', flexShrink: 0 }}>
            ${booking.priceUSD}
          </div>
        </div>
        {booking.creditsUsed > 0 && (
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--good)' }}>
            ⭐ {booking.creditsUsed} credits applied — you saved ${booking.creditsUsed}
          </div>
        )}
      </div>

      {/* Check-in instructions */}
      <div className="detail-card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📋 Check-in instructions</div>
        <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {instructions.map((line, i) => (
            <li key={i} style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{line}</li>
          ))}
        </ul>
        {hotel.phone && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href={`tel:${hotel.phone}`} className="btn-ghost" style={{ fontSize: 13, padding: '8px 14px' }}>
              📞 Call front desk
            </a>
            <DirectionsLink hotel={hotel} />
          </div>
        )}
        {!hotel.phone && <div style={{ marginTop: 10 }}><DirectionsLink hotel={hotel} /></div>}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn-primary"
          style={{ padding: 13, fontSize: 15 }}
          onClick={() => nav(`/review/${booking.id}`, { state: { booking, hotel } })}
        >
          ✍️ Write a review — help other travelers
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/my-bookings" className="btn-ghost" style={{ flex: 1, textAlign: 'center', padding: 12 }}>My Bookings</Link>
          <Link to="/groups/new" className="btn-ghost" style={{ flex: 1, textAlign: 'center', padding: 12 }}>👥 Plan group trip</Link>
          <Link to="/" className="btn-ghost" style={{ flex: 1, textAlign: 'center', padding: 12 }}>More deals</Link>
        </div>
      </div>
    </div>
  );
}
