import React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store.jsx';

export default function ConfirmationPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const { bookings, hotels, credits } = useApp();

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

  return (
    <div style={{ maxWidth: 580, margin: '40px auto' }}>
      <div className="detail-card" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 48 }}>🔑</div>
        <h1 style={{ margin: '12px 0 6px' }}>You're booked!</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          Confirmation <code>{booking.id}</code> sent to {booking.guestEmail}
        </p>

        {/* Credits earned banner */}
        <div
          style={{
            background: 'rgba(255,184,77,0.12)',
            border: '1px solid rgba(255,184,77,0.28)',
            borderRadius: 12,
            padding: '12px 16px',
            margin: '18px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 28 }}>⭐</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--warn)' }}>+{creditsEarned} NightDrop Credits earned</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Your balance is now {credits.toLocaleString()} credits — use them on your next booking.
            </div>
          </div>
        </div>

        {/* Booking detail card */}
        <div
          style={{
            margin: '18px 0 0',
            padding: 16,
            borderRadius: 12,
            background: 'var(--bg-elev)',
            border: '1px solid var(--border)',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: 10,
                backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundImage: `url(${hotel.image})`
              }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>{hotel.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>{hotel.neighborhood}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                {booking.roomType || 'Standard Room'} · {booking.checkInTime || 'Standard check-in'}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>Guest: {booking.guestName}</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 16 }}>
          Charged ${booking.priceUSD} to your card ending in ••••
          {booking.creditsUsed > 0 && (
            <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--good)', marginTop: 4 }}>
              ⭐ {booking.creditsUsed} credits applied — you saved ${booking.creditsUsed}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          <button
            className="btn-primary"
            style={{ padding: '13px', fontSize: 15 }}
            onClick={() => nav(`/review/${booking.id}`, { state: { booking, hotel } })}
          >
            ✍️ Write a review — help other travelers
          </button>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/my-bookings" className="btn-ghost" style={{ flex: 1, textAlign: 'center', padding: 12 }}>
              My Bookings
            </Link>
            <Link to="/" className="btn-ghost" style={{ flex: 1, textAlign: 'center', padding: 12 }}>
              Find another deal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
