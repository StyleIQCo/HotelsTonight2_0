import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';

const STATUS_COLORS = {
  upcoming: { bg: 'rgba(55,214,160,0.12)', text: 'var(--good)', label: 'Upcoming' },
  completed: { bg: 'rgba(154,164,199,0.12)', text: 'var(--muted)', label: 'Completed' },
  cancelled: { bg: 'rgba(255,77,109,0.10)', text: 'var(--accent)', label: 'Cancelled' },
};

function BookingStatus({ booking }) {
  const created = new Date(booking.createdAt);
  const checkin = new Date(created);
  checkin.setHours(15, 0, 0, 0); // 3pm check-in
  const now = new Date();
  const key = now < checkin ? 'upcoming' : 'completed';
  const { bg, text, label } = STATUS_COLORS[key];
  return (
    <span style={{ background: bg, color: text, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      {label}
    </span>
  );
}

export default function MyBookingsPage() {
  const { bookings, hotels, credits } = useApp();
  const nav = useNavigate();

  const enriched = bookings.map((b) => ({
    ...b,
    hotel: hotels.find((h) => h.id === b.hotelId),
  }));

  return (
    <div style={{ maxWidth: 720, margin: '32px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>My Bookings</h1>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0', fontSize: 14 }}>
            Your NightDrop stay history
          </p>
        </div>
        <div className="credits-badge-lg">
          <span>⭐</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{credits.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>NightDrop Credits</div>
          </div>
        </div>
      </div>

      {enriched.length === 0 && (
        <div className="empty-state">
          <p>No bookings yet — your stays will appear here.</p>
          <Link to="/" className="btn-primary">Find tonight's deals</Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {enriched.map((b) => (
          <div key={b.id} className="detail-card booking-card">
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {b.hotel && (
                <div
                  style={{
                    width: 80, height: 80, borderRadius: 10,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundImage: `url(${b.hotel.image})`,
                    flexShrink: 0
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{b.hotelName}</div>
                    {b.hotel && (
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.hotel.neighborhood}</div>
                    )}
                  </div>
                  <BookingStatus booking={b} />
                </div>

                <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div className="booking-meta">
                    <span className="booking-meta-label">Confirmation</span>
                    <span className="booking-meta-val">{b.id}</span>
                  </div>
                  <div className="booking-meta">
                    <span className="booking-meta-label">Room</span>
                    <span className="booking-meta-val">{b.roomType || 'Standard Room'}</span>
                  </div>
                  <div className="booking-meta">
                    <span className="booking-meta-label">Check-in</span>
                    <span className="booking-meta-val">{b.checkInTime || 'Standard (3 PM)'}</span>
                  </div>
                  <div className="booking-meta">
                    <span className="booking-meta-label">Charged</span>
                    <span className="booking-meta-val" style={{ color: 'var(--good)', fontWeight: 700 }}>
                      ${b.priceUSD}
                    </span>
                  </div>
                  {b.creditsEarned > 0 && (
                    <div className="booking-meta">
                      <span className="booking-meta-label">Credits earned</span>
                      <span className="booking-meta-val" style={{ color: 'var(--warn)' }}>
                        ⭐ +{b.creditsEarned}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {b.hotel && (
                    <Link to={`/hotel/${b.hotel.id}`} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>
                      View hotel
                    </Link>
                  )}
                  {!b.reviewed && (
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={() => nav(`/review/${b.id}`, { state: { booking: b, hotel: b.hotel } })}
                    >
                      ✍️ Write a review
                    </button>
                  )}
                  {b.reviewed && (
                    <span style={{ fontSize: 12, color: 'var(--good)', paddingTop: 6 }}>✅ Review submitted</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
