import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store.jsx';

const STAY_TYPES = ['Solo', 'Couple', 'Business', 'Family', 'Friends', 'Girls Trip', 'Anniversary'];

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            fontSize: 32,
            padding: 0,
            cursor: 'pointer',
            color: n <= (hovered || value) ? '#ffb84d' : 'var(--border)',
            transition: 'color 0.1s',
          }}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span style={{ alignSelf: 'center', color: 'var(--muted)', fontSize: 13, marginLeft: 6 }}>
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

export default function WriteReviewPage() {
  const { id: bookingId } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const { bookings, hotels, addReview, markBookingReviewed } = useApp();

  const booking = state?.booking || bookings.find((b) => b.id === bookingId);
  const hotel = state?.hotel || hotels.find((h) => h.id === booking?.hotelId);

  const [rating, setRating] = useState(0);
  const [stayType, setStayType] = useState('');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!booking || !hotel) {
    return (
      <div className="empty-state">
        <p>We couldn't find that booking.</p>
        <Link to="/my-bookings" className="btn-ghost">My Bookings</Link>
      </div>
    );
  }

  if (booking.reviewed || submitted) {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}>
        <div className="detail-card" style={{ padding: 40 }}>
          <div style={{ fontSize: 48 }}>⭐</div>
          <h2 style={{ margin: '14px 0 6px' }}>Review submitted!</h2>
          <p style={{ color: 'var(--muted)' }}>
            Thanks for helping other travelers. Your review for <strong>{hotel.name}</strong> is live.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <Link to="/my-bookings" className="btn-ghost">My Bookings</Link>
            <Link to="/" className="btn-primary">Find more deals</Link>
          </div>
        </div>
      </div>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!rating || !text.trim()) return;

    addReview({
      hotelId: hotel.id,
      authorName: booking.guestName,
      authorCity: '',
      rating,
      stayType,
      text: text.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    markBookingReviewed(bookingId);
    setSubmitted(true);
  }

  return (
    <div style={{ maxWidth: 580, margin: '32px auto' }}>
      <h1 style={{ marginBottom: 6 }}>Write a review</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        Share your experience at <strong>{hotel.name}</strong>
      </p>

      <div className="detail-card" style={{ marginBottom: 20, display: 'flex', gap: 14 }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: 10, flexShrink: 0,
            backgroundSize: 'cover', backgroundPosition: 'center',
            backgroundImage: `url(${hotel.image})`
          }}
        />
        <div>
          <div style={{ fontWeight: 700 }}>{hotel.name}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>{hotel.neighborhood}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            Booking {booking.id} · {booking.roomType || 'Standard Room'}
          </div>
        </div>
      </div>

      <form className="detail-card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="field">
          <label style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>Your rating *</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <div className="field">
          <label style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>Type of stay</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STAY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`filter-chip${stayType === t ? ' active' : ''}`}
                onClick={() => setStayType(stayType === t ? '' : t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="review-text" style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>
            Your review * <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({text.length}/1000)</span>
          </label>
          <textarea
            id="review-text"
            className="input"
            rows={5}
            placeholder="Tell other travelers what made your stay memorable..."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1000))}
            style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
          />
        </div>

        {(!rating || !text.trim()) && (
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Please add a rating and write at least a few words.
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '14px', fontSize: 15 }}
          disabled={!rating || !text.trim()}
        >
          Submit review
        </button>
      </form>
    </div>
  );
}
