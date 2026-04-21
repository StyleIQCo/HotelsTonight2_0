import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../store.jsx';

export default function ConfirmationPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const { bookings, hotels } = useApp();

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

  return (
    <div style={{ maxWidth: 580, margin: '40px auto' }}>
      <div className="detail-card" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 48 }}>🔑</div>
        <h1 style={{ margin: '12px 0 6px' }}>You're booked!</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          Confirmation <code>{booking.id}</code> sent to {booking.guestEmail}
        </p>

        <div
          style={{
            margin: '22px 0',
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
                Check-in tonight · Guest: {booking.guestName}
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 18, fontWeight: 700 }}>
          Charged ${booking.priceUSD} to your card ending in ••••
        </div>
        <Link to="/" className="btn-ghost" style={{ marginTop: 20, display: 'inline-block' }}>
          Find another deal
        </Link>
      </div>
    </div>
  );
}
