import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import { useApp } from '../store.jsx';
import { makeRoomTypes } from '../lib/pricing.js';

// Load Stripe lazily with the publishable test key from env.
// Falls back to a clearly-broken placeholder so the UI still renders during
// development without requiring the env var to be set.
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

const cardStyle = {
  style: {
    base: {
      color: '#f5f7ff',
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#9aa4c7' }
    },
    invalid: { color: '#ff6b84' }
  }
};

const ARRIVAL_WINDOWS = [
  { id: 'early',     emoji: '🌅', label: 'Early check-in',    range: '11 AM – 3 PM',    surcharge: 25,  note: 'Request early access' },
  { id: 'afternoon', emoji: '🌤️', label: 'Afternoon',         range: '3 PM – 7 PM',     surcharge: 0,   note: 'Standard check-in' },
  { id: 'evening',   emoji: '🌆', label: 'Evening arrival',   range: '7 PM – 10 PM',    surcharge: -10, note: 'Late Drop applied' },
  { id: 'night',     emoji: '🌙', label: 'Night arrival',     range: '10 PM – Midnight', surcharge: -20, note: 'Late Drop applied' },
  { id: 'latenight', emoji: '🌃', label: 'Late night',        range: 'Midnight – 4 AM', surcharge: -25, note: 'Late Drop applied' },
];

const LATE_CHECKOUT = { id: 'late_out', label: 'Late check-out (noon)', surcharge: 15 };

function CheckoutInner({ hotel, pricing, baseTotal, tax, roomType, creditsToApply, lockedPrice,
  arrivalWindow, setArrivalWindow, wantLateCheckout, setWantLateCheckout }) {
  const stripe = useStripe();
  const elements = useElements();
  const { recordBooking, pushToast, spendCredits, user, tier } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const arrivalSurcharge = ARRIVAL_WINDOWS.find((o) => o.id === arrivalWindow)?.surcharge || 0;
  const lateCheckoutSurcharge = wantLateCheckout ? LATE_CHECKOUT.surcharge : 0;
  const total = baseTotal + arrivalSurcharge + lateCheckoutSurcharge - creditsToApply;
  const selectedWindow = ARRIVAL_WINDOWS.find((o) => o.id === arrivalWindow);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);

    if (!stripe || !elements) {
      setErr('Payment is still loading. Try again in a moment.');
      return;
    }
    if (!name || !email) {
      setErr('Please enter your name and email.');
      return;
    }

    setSubmitting(true);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
      billing_details: { name, email }
    });

    if (error) {
      setErr(error.message);
      setSubmitting(false);
      return;
    }

    if (creditsToApply > 0) spendCredits(creditsToApply);

    const arrivalLabel = `${selectedWindow.emoji} ${selectedWindow.label} (${selectedWindow.range})${wantLateCheckout ? ' · Late check-out' : ''}`;
    const booking = {
      id: `bk_${Math.random().toString(36).slice(2, 9)}`,
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomType: roomType?.name || 'Standard Room',
      checkInTime: arrivalLabel,
      guestName: name,
      guestEmail: email,
      priceUSD: total,
      creditsUsed: creditsToApply,
      paymentMethodId: paymentMethod?.id || 'pm_demo'
    };
    recordBooking(booking);
    pushToast({
      title: 'Booking confirmed! ⭐ +' + Math.round(total * 0.05) + ' credits earned',
      body: `You're in at ${hotel.name} tonight. Confirmation sent to ${email}.`
    });
    nav(`/confirmation/${booking.id}`, { state: { booking, hotel } });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="name">Guest name</label>
        <input
          id="name"
          className="input"
          placeholder="Full name on ID"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="email">Email for confirmation</label>
        <input
          id="email"
          className="input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>When will you arrive?</label>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
          Arrive late and pay less — your room is guaranteed regardless.
        </div>
        <div className="arrival-grid">
          {ARRIVAL_WINDOWS.map((opt) => {
            const isLate = opt.surcharge < 0;
            const isSel = arrivalWindow === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`arrival-option${isSel ? ' selected' : ''}`}
                onClick={() => setArrivalWindow(opt.id)}
              >
                <span className="arrival-option-emoji">{opt.emoji}</span>
                <span className="arrival-option-label">{opt.label}</span>
                <span className="arrival-option-range">{opt.range}</span>
                <span
                  className="arrival-option-price"
                  style={{ color: isLate ? 'var(--good)' : opt.surcharge > 0 ? 'var(--warn)' : 'var(--muted)' }}
                >
                  {opt.surcharge < 0 ? `−$${Math.abs(opt.surcharge)} Late Drop` : opt.surcharge > 0 ? `+$${opt.surcharge}` : 'Included'}
                </span>
              </button>
            );
          })}
        </div>
        {selectedWindow?.surcharge < 0 && (
          <div className="late-drop-callout">
            🌙 Late Drop active — you save ${Math.abs(selectedWindow.surcharge)} by arriving {selectedWindow.label.toLowerCase()}. Your room is guaranteed until {hotel.latestCheckIn || '2:00 AM'}.
          </div>
        )}
      </div>

      <div className="field">
        <label className={`checkin-option${wantLateCheckout ? ' selected' : ''}`} style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={wantLateCheckout}
            onChange={(e) => setWantLateCheckout(e.target.checked)}
            style={{ display: 'none' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>🌅 Late check-out</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Check out by noon next day</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--warn)' }}>+$15</div>
        </label>
      </div>

      {/* Apple Pay / Google Pay simulation */}
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="apple-pay-btn"
          onClick={() => {
            // Simulate instant payment — in production this triggers the Payment Request API
            setSubmitting(true);
            setTimeout(() => {
              if (creditsToApply > 0) spendCredits(creditsToApply);
              const arrivalLabel = `${selectedWindow.emoji} ${selectedWindow.label} (${selectedWindow.range})${wantLateCheckout ? ' · Late check-out' : ''}`;
              const booking = {
                id: `bk_${Math.random().toString(36).slice(2, 9)}`,
                hotelId: hotel.id,
                hotelName: hotel.name,
                roomType: roomType?.name || 'Standard Room',
                checkInTime: arrivalLabel,
                guestName: name || user?.name || 'Guest',
                guestEmail: email || user?.email || '',
                priceUSD: total,
                creditsUsed: creditsToApply,
                paymentMethodId: 'pm_applepay_demo',
              };
              recordBooking(booking);
              pushToast({ title: 'Booked via Apple Pay ✓', body: `You're in at ${hotel.name} tonight.` });
              nav(`/confirmation/${booking.id}`, { state: { booking, hotel } });
            }, 700);
          }}
          disabled={submitting}
        >
           Pay with Apple Pay
        </button>
        <div className="or-divider"><span>or pay by card</span></div>
      </div>

      <div className="field">
        <label>Card (Stripe test mode)</label>
        <div className="input" style={{ padding: 14 }}>
          <CardElement options={cardStyle} />
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>
          Use <code>4242 4242 4242 4242</code>, any future date, any CVC.
        </div>
      </div>

      {err && (
        <div
          style={{
            background: 'rgba(255, 107, 132, 0.1)',
            border: '1px solid rgba(255, 107, 132, 0.4)',
            borderRadius: 10,
            padding: '10px 14px',
            color: '#ff6b84',
            fontSize: 14,
            marginBottom: 12
          }}
        >
          {err}
        </div>
      )}

      <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14 }} disabled={submitting}>
        {submitting ? 'Charging card…' : `Pay $${total} · Book now`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { hotels, bookingDate, credits, getActiveLock } = useApp();
  const hotel = hotels.find((h) => h.id === id);
  const [useCredits, setUseCredits] = useState(false);
  const [arrivalWindow, setArrivalWindow] = useState('afternoon');
  const [wantLateCheckout, setWantLateCheckout] = useState(false);

  const activeLock = hotel ? getActiveLock(hotel.id) : null;

  const totals = useMemo(() => {
    if (!hotel) return null;
    const p = hotel.pricing;
    const roomTypes = makeRoomTypes(hotel);
    const roomId = searchParams.get('room') || 'standard';
    const roomType = roomTypes.find((r) => r.id === roomId) || roomTypes[0];
    const baseRate = activeLock ? activeLock.price : Math.round(p.final * roomType.multiplier);
    const tax = Math.round(baseRate * 0.14);
    const baseTotal = baseRate + tax - (activeLock?.deposit || 0);
    const maxCredits = Math.min(credits, Math.round(baseTotal * 0.20));
    return { pricing: p, tax, baseTotal, roomType, adjustedFinal: baseRate, maxCredits };
  }, [hotel, searchParams, credits, activeLock]);

  if (!hotel) {
    return (
      <div className="empty-state">
        <p>We couldn't find that booking.</p>
        <Link to="/" className="btn-ghost">Back to tonight's deals</Link>
      </div>
    );
  }

  return (
    <div className="detail-grid" style={{ marginTop: 20 }}>
      <div className="detail-card">
        <h2 style={{ marginTop: 0 }}>Confirm and pay</h2>
        {activeLock && (
          <div style={{ background: 'rgba(55,214,160,0.08)', border: '1px solid rgba(55,214,160,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--good)', marginBottom: 16 }}>
            🔒 Locked rate applied — ${activeLock.price}/night{activeLock.deposit > 0 ? ` (−$${activeLock.deposit} deposit already paid)` : ' (free with your tier)'}
          </div>
        )}
        {/* Credits toggle */}
        {credits > 0 && (
          <div className="credits-apply-row">
            <label className="credits-apply-label">
              <input
                type="checkbox"
                checked={useCredits}
                onChange={(e) => setUseCredits(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              <span>
                ⭐ Apply NightDrop Credits
                <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                  {' '}— up to ${totals.maxCredits} off (you have {credits} credits)
                </span>
              </span>
            </label>
          </div>
        )}

        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <CheckoutInner
              hotel={hotel}
              pricing={totals.pricing}
              tax={totals.tax}
              baseTotal={totals.baseTotal}
              roomType={totals.roomType}
              creditsToApply={useCredits ? totals.maxCredits : 0}
              arrivalWindow={arrivalWindow}
              setArrivalWindow={setArrivalWindow}
              wantLateCheckout={wantLateCheckout}
              setWantLateCheckout={setWantLateCheckout}
            />
          </Elements>
        ) : (
          <MissingKeyNotice />
        )}
      </div>

      <aside>
        <div className="detail-card">
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundImage: `url(${hotel.image})`
              }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>{hotel.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>{hotel.neighborhood}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>1 night · check-in tonight</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="checkout-summary">
              <span>Room type</span>
              <span style={{ color: 'var(--muted)' }}>{totals.roomType?.name}</span>
            </div>
            {(() => {
              const arrSurcharge = ARRIVAL_WINDOWS.find((o) => o.id === arrivalWindow)?.surcharge || 0;
              const lcoSurcharge = wantLateCheckout ? LATE_CHECKOUT.surcharge : 0;
              const creditsOff = useCredits ? totals.maxCredits : 0;
              const grandTotal = totals.baseTotal + arrSurcharge + lcoSurcharge - creditsOff;
              return (
                <>
                  <div className="checkout-summary">
                    <span>Nightly rate</span>
                    <span>${totals.adjustedFinal}</span>
                  </div>
                  {arrSurcharge < 0 && (
                    <div className="checkout-summary" style={{ color: 'var(--good)' }}>
                      <span>🌙 Late Drop</span>
                      <span>−${Math.abs(arrSurcharge)}</span>
                    </div>
                  )}
                  {arrSurcharge > 0 && (
                    <div className="checkout-summary" style={{ color: 'var(--warn)' }}>
                      <span>🌅 Early check-in</span>
                      <span>+${arrSurcharge}</span>
                    </div>
                  )}
                  {lcoSurcharge > 0 && (
                    <div className="checkout-summary" style={{ color: 'var(--warn)' }}>
                      <span>🌅 Late check-out</span>
                      <span>+${lcoSurcharge}</span>
                    </div>
                  )}
                  <div className="checkout-summary">
                    <span>Taxes & fees</span>
                    <span>${totals.tax}</span>
                  </div>
                  {creditsOff > 0 && (
                    <div className="checkout-summary" style={{ color: 'var(--good)' }}>
                      <span>⭐ Credits applied</span>
                      <span>−${creditsOff}</span>
                    </div>
                  )}
                  <div className="checkout-summary" style={{ fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 6 }}>
                    <span>Total</span>
                    <span>${grandTotal}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--warn)', marginTop: 8 }}>
                    ⭐ You'll earn ~{Math.round(grandTotal * 0.05)} credits from this booking
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </aside>
    </div>
  );
}

function MissingKeyNotice() {
  return (
    <div
      style={{
        padding: 16,
        border: '1px dashed var(--border)',
        borderRadius: 10,
        color: 'var(--muted)',
        lineHeight: 1.5
      }}
    >
      <strong style={{ color: 'var(--text)' }}>Stripe test key not set.</strong>
      <p style={{ margin: '6px 0 0' }}>
        Add <code>VITE_STRIPE_PUBLISHABLE_KEY</code> to <code>.env.local</code>, then
        restart <code>npm run dev</code>. See the README.
      </p>
    </div>
  );
}
