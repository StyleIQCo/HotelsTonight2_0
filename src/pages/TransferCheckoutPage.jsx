import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store.jsx';

function timeAgo(isoStr) {
  const mins = Math.round((Date.now() - new Date(isoStr)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  return `${Math.floor(mins / 60)} hours ago`;
}

export default function TransferCheckoutPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { transfers, buyTransfer, hotels, EXCHANGE_FEE } = useApp();

  const tx = transfers.find((t) => t.id === id);
  const hotel = tx ? hotels.find((h) => h.id === tx.hotelId) : null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [newBookingId, setNewBookingId] = useState(null);

  if (!tx) {
    return (
      <div className="empty-state">
        <p>This listing is no longer available.</p>
        <Link to="/exchange" className="btn-ghost">Browse Exchange</Link>
      </div>
    );
  }

  if (tx.status !== 'available') {
    return (
      <div className="empty-state">
        <p>This booking was just claimed by someone else.</p>
        <Link to="/exchange" className="btn-ghost">Browse Exchange</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ maxWidth: 540, margin: '60px auto', textAlign: 'center' }}>
        <div className="detail-card" style={{ padding: 40 }}>
          <div style={{ fontSize: 52 }}>🔑</div>
          <h2 style={{ margin: '14px 0 6px' }}>Booking transferred!</h2>
          <p style={{ color: 'var(--muted)' }}>
            You're now checked in at <strong>{tx.hotelName}</strong> tonight.
            Confirmation sent to {email}.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <Link to="/my-bookings" className="btn-primary">View my bookings</Link>
            <Link to="/exchange" className="btn-ghost">Browse Exchange</Link>
          </div>
        </div>
      </div>
    );
  }

  const image = hotel?.image || tx.hotelImage;
  const savings = tx.originalPrice - tx.listPrice;
  const savingsPct = savings > 0 ? Math.round((savings / tx.originalPrice) * 100) : 0;
  const ndFee = Math.round(tx.listPrice * EXCHANGE_FEE);
  const sellerReceives = tx.listPrice - ndFee;

  async function handleClaim(e) {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    // Simulate a brief processing delay
    await new Promise((r) => setTimeout(r, 900));
    const bookingId = buyTransfer(tx.id, name, email);
    setNewBookingId(bookingId);
    setDone(true);
    setSubmitting(false);
  }

  return (
    <div className="detail-grid" style={{ marginTop: 24 }}>
      {/* Form */}
      <div>
        <div style={{ marginBottom: 8 }}>
          <Link to="/exchange" style={{ color: 'var(--muted)', fontSize: 13 }}>← Exchange</Link>
        </div>
        <h2 style={{ marginTop: 8, marginBottom: 4 }}>Claim this booking</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
          This booking will be transferred to your name instantly. No card processing delays.
        </p>

        {/* Seller note */}
        {tx.sellerNote && (
          <div className="exchange-seller-note" style={{ marginBottom: 20 }}>
            <strong>{tx.sellerName}</strong> says: "{tx.sellerNote}"
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              Listed {timeAgo(tx.listedAt)}
            </div>
          </div>
        )}

        <form className="detail-card" onSubmit={handleClaim} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label htmlFor="t-name">Your name</label>
            <input
              id="t-name"
              className="input"
              placeholder="Full name (for hotel check-in)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="t-email">Your email</label>
            <input
              id="t-email"
              className="input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              background: 'rgba(55,214,160,0.07)',
              border: '1px solid rgba(55,214,160,0.2)',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 13,
              color: 'var(--muted)',
              lineHeight: 1.6,
            }}
          >
            🔒 By claiming, you agree the booking transfers immediately and is non-refundable.
            NightDrop takes a {Math.round(EXCHANGE_FEE * 100)}% exchange fee ({' '}
            <strong>${ndFee}</strong>) from the seller.
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '14px', fontSize: 15 }}
            disabled={submitting || !name || !email}
          >
            {submitting ? 'Transferring booking…' : `Claim for $${tx.listPrice}`}
          </button>
        </form>
      </div>

      {/* Summary sidebar */}
      <aside>
        <div className="detail-card">
          <div
            style={{
              height: 160,
              borderRadius: 10,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundImage: `url(${image})`,
              marginBottom: 14,
            }}
          />
          <div style={{ fontWeight: 700, fontSize: 15 }}>{tx.hotelName}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>{tx.neighborhood}</div>

          <div className="checkout-summary">
            <span>Room</span>
            <span style={{ color: 'var(--muted)' }}>{tx.roomType}</span>
          </div>
          <div className="checkout-summary">
            <span>Check-in</span>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{tx.checkInTime}</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
            {savings > 0 && (
              <div className="checkout-summary">
                <span>Original booking price</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--muted)' }}>${tx.originalPrice}</span>
              </div>
            )}
            <div className="checkout-summary" style={{ fontWeight: 700, fontSize: 16 }}>
              <span>You pay</span>
              <span style={{ color: 'var(--good)' }}>${tx.listPrice}</span>
            </div>
            {savings > 0 && (
              <div style={{ color: 'var(--good)', fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                You save ${savings} ({savingsPct}% off)
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: 12,
              padding: '10px 12px',
              background: 'rgba(255,184,77,0.08)',
              border: '1px solid rgba(255,184,77,0.2)',
              borderRadius: 10,
              fontSize: 12,
              color: 'var(--warn)',
            }}
          >
            ⭐ You'll earn ~{Math.round(tx.listPrice * 0.05)} NightDrop Credits from this transfer
          </div>
        </div>
      </aside>
    </div>
  );
}
