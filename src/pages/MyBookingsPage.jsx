import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';

const STATUS_COLORS = {
  upcoming:   { bg: 'rgba(55,214,160,0.12)',  text: 'var(--good)',   label: 'Upcoming' },
  completed:  { bg: 'rgba(154,164,199,0.12)', text: 'var(--muted)',  label: 'Completed' },
  listed:     { bg: 'rgba(255,184,77,0.12)',  text: 'var(--warn)',   label: 'Listed on Exchange' },
  transferred:{ bg: 'rgba(154,164,199,0.12)', text: 'var(--muted)',  label: 'Transferred' },
};

function BookingStatus({ booking }) {
  if (booking.transferred) return (
    <span style={{ background: STATUS_COLORS.transferred.bg, color: STATUS_COLORS.transferred.text, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      Transferred
    </span>
  );
  if (booking.listedOnExchange) return (
    <span style={{ background: STATUS_COLORS.listed.bg, color: STATUS_COLORS.listed.text, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      🔄 Listed on Exchange
    </span>
  );
  const created = new Date(booking.createdAt);
  const checkin = new Date(created); checkin.setHours(15, 0, 0, 0);
  const key = new Date() < checkin ? 'upcoming' : 'completed';
  const { bg, text, label } = STATUS_COLORS[key];
  return (
    <span style={{ background: bg, color: text, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      {label}
    </span>
  );
}

function ListOnExchangePanel({ booking, onCancel }) {
  const { listForTransfer, cancelTransferListing, EXCHANGE_FEE } = useApp();
  const [price, setPrice] = useState(booking.priceUSD);
  const [note, setNote] = useState('');
  const [listing, setListing] = useState(false);

  const minPrice = Math.round(booking.priceUSD * 0.70);
  const maxPrice = Math.round(booking.priceUSD * 1.20);
  const ndFee = Math.round(price * EXCHANGE_FEE);
  const youGet = price - ndFee;

  if (booking.listedOnExchange) {
    return (
      <div className="exchange-listing-active">
        <div>
          <div style={{ fontWeight: 700, color: 'var(--warn)' }}>🔄 Listed on Exchange</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            Asking ${booking.listedOnExchangePrice || 'TBD'} · visible to all NightDrop users
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/exchange" className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}>
            View listing
          </Link>
          <button
            className="btn-ghost"
            style={{ padding: '7px 14px', fontSize: 13, color: 'var(--accent)', borderColor: 'var(--accent-soft)' }}
            onClick={() => cancelTransferListing(booking.listedOnExchange)}
          >
            Remove listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exchange-list-form">
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
        🔄 List on NightDrop Exchange
      </div>

      <div className="field">
        <label style={{ marginBottom: 6, display: 'block', fontSize: 13 }}>
          Your asking price: <strong>${price}</strong>
          <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
            {' '}(you paid ${booking.priceUSD})
          </span>
        </label>
        <input
          type="range"
          className="slider"
          min={minPrice}
          max={maxPrice}
          step={5}
          value={price}
          onChange={(e) => setPrice(+e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          <span>${minPrice} (−30%)</span>
          <span>${maxPrice} (+20%)</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex', gap: 16, background: 'var(--bg-card)',
          borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 12,
        }}
      >
        <div><div style={{ color: 'var(--muted)', fontSize: 11 }}>Buyer pays</div><div style={{ fontWeight: 700 }}>${price}</div></div>
        <div><div style={{ color: 'var(--muted)', fontSize: 11 }}>NightDrop fee (10%)</div><div style={{ fontWeight: 700, color: 'var(--accent)' }}>−${ndFee}</div></div>
        <div><div style={{ color: 'var(--muted)', fontSize: 11 }}>You receive</div><div style={{ fontWeight: 700, color: 'var(--good)' }}>${youGet}</div></div>
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="seller-note" style={{ marginBottom: 6, display: 'block', fontSize: 13 }}>
          Note to buyer <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          id="seller-note"
          className="input"
          placeholder="e.g. Flight cancelled, great hotel, someone should enjoy it!"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ fontSize: 13 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn-primary"
          style={{ padding: '10px 18px', fontSize: 13 }}
          disabled={listing}
          onClick={() => {
            setListing(true);
            listForTransfer(booking.id, price, note);
            setTimeout(() => setListing(false), 300);
            onCancel();
          }}
        >
          {listing ? 'Listing…' : 'List now →'}
        </button>
        <button className="btn-ghost" style={{ padding: '10px 14px', fontSize: 13 }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function BundleBookingCard({ b }) {
  return (
    <div className="detail-card booking-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>🎭</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{b.bundleName}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.city} · Night Out Bundle</div>
        </div>
        <span style={{ marginLeft: 'auto', background: 'rgba(255,77,109,0.12)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
          Night Out
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
        <div className="booking-meta">
          <span className="booking-meta-label">Confirmation</span>
          <span className="booking-meta-val">{b.id}</span>
        </div>
        <div className="booking-meta">
          <span className="booking-meta-label">Guests</span>
          <span className="booking-meta-val">{b.guests}</span>
        </div>
        <div className="booking-meta">
          <span className="booking-meta-label">Total paid</span>
          <span className="booking-meta-val" style={{ color: 'var(--good)', fontWeight: 700 }}>${b.totalUSD}</span>
        </div>
        {b.creditsEarned > 0 && (
          <div className="booking-meta">
            <span className="booking-meta-label">Credits earned</span>
            <span className="booking-meta-val" style={{ color: 'var(--warn)' }}>⭐ +{b.creditsEarned}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: 'var(--muted)' }}>
        <span>🍽 {b.dinnerRestaurant} · {b.dinnerTime}</span>
        <span>🎭 {b.experienceName} · {b.experienceTime}</span>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const { bookings, hotels, credits, bundleBookings } = useApp();
  const nav = useNavigate();
  const [openExchangePanel, setOpenExchangePanel] = useState(null);

  const enriched = bookings.map((b) => ({
    ...b,
    hotel: hotels.find((h) => h.id === b.hotelId),
  }));

  // Determine if a booking is eligible to list (upcoming, not yet transferred, not already listed)
  function canList(b) {
    if (b.transferred || b.listedOnExchange) return false;
    const created = new Date(b.createdAt);
    const checkin = new Date(created); checkin.setHours(23, 59, 0, 0); // same day
    return new Date() < checkin;
  }

  return (
    <div style={{ maxWidth: 720, margin: '32px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>My Bookings</h1>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0', fontSize: 14 }}>
            Your NightDrop stay history
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/exchange" className="btn-ghost" style={{ padding: '9px 16px', fontSize: 13 }}>
            🔄 Exchange
          </Link>
          <div className="credits-badge-lg">
            <span>⭐</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{credits.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>NightDrop Credits</div>
            </div>
          </div>
        </div>
      </div>

      {enriched.length === 0 && bundleBookings.length === 0 && (
        <div className="empty-state">
          <p>No bookings yet — your stays will appear here.</p>
          <Link to="/" className="btn-primary">Find tonight's deals</Link>
        </div>
      )}

      {bundleBookings.length > 0 && (
        <>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            🎭 Night Out Bundles
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {bundleBookings.map((b) => <BundleBookingCard key={b.id} b={b} />)}
          </div>
          {enriched.length > 0 && (
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              🏨 Hotel Bookings
            </div>
          )}
        </>
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
                    flexShrink: 0,
                    opacity: b.transferred ? 0.5 : 1,
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
                    {b.transferredFrom && (
                      <div style={{ fontSize: 11, color: 'var(--good)', marginTop: 2 }}>🔄 Claimed from Exchange</div>
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

                {!b.transferred && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {b.hotel && (
                      <Link to={`/hotel/${b.hotel.id}`} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>
                        View hotel
                      </Link>
                    )}
                    {!b.reviewed && !b.listedOnExchange && (
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: 12 }}
                        onClick={() => nav(`/review/${b.id}`, { state: { booking: b, hotel: b.hotel } })}
                      >
                        ✍️ Write a review
                      </button>
                    )}
                    {b.reviewed && (
                      <span style={{ fontSize: 12, color: 'var(--good)', paddingTop: 6 }}>✅ Reviewed</span>
                    )}
                    {canList(b) && openExchangePanel !== b.id && (
                      <button
                        className="btn-ghost"
                        style={{ padding: '6px 14px', fontSize: 12, color: 'var(--warn)', borderColor: 'rgba(255,184,77,0.3)' }}
                        onClick={() => setOpenExchangePanel(b.id)}
                      >
                        🔄 Can't make it? Sell this
                      </button>
                    )}
                  </div>
                )}

                {/* Inline Exchange listing panel */}
                {canList(b) && openExchangePanel === b.id && (
                  <div style={{ marginTop: 12 }}>
                    <ListOnExchangePanel
                      booking={b}
                      onCancel={() => setOpenExchangePanel(null)}
                    />
                  </div>
                )}

                {/* Show manage button if already listed */}
                {b.listedOnExchange && (
                  <div style={{ marginTop: 10 }}>
                    <ListOnExchangePanel
                      booking={b}
                      onCancel={() => {}}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
