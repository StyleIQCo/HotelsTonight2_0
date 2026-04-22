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

const CHECK_IN_OPTIONS = [
  { id: 'standard',  label: 'Standard check-in',   time: '3:00 PM',  surcharge: 0 },
  { id: 'early',     label: 'Early check-in',       time: '11:00 AM', surcharge: 25 },
  { id: 'late_out',  label: 'Late check-out',       time: '12:00 PM next day', surcharge: 15 },
];

function CheckoutInner({ hotel, pricing, baseTotal, tax, roomType, creditsToApply }) {
  const stripe = useStripe();
  const elements = useElements();
  const { recordBooking, pushToast, spendCredits } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [checkInOption, setCheckInOption] = useState('standard');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const surcharge = CHECK_IN_OPTIONS.find((o) => o.id === checkInOption)?.surcharge || 0;
  const total = baseTotal + surcharge - creditsToApply;

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

    const checkInLabel = CHECK_IN_OPTIONS.find((o) => o.id === checkInOption)?.label || 'Standard check-in';
    const booking = {
      id: `bk_${Math.random().toString(36).slice(2, 9)}`,
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomType: roomType?.name || 'Standard Room',
      checkInTime: checkInLabel,
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
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 600 }}>Check-in preference</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CHECK_IN_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={`checkin-option${checkInOption === opt.id ? ' selected' : ''}`}
            >
              <input
                type="radio"
                name="checkin"
                value={opt.id}
                checked={checkInOption === opt.id}
                onChange={() => setCheckInOption(opt.id)}
                style={{ display: 'none' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{opt.time}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: opt.surcharge > 0 ? 'var(--warn)' : 'var(--good)' }}>
                {opt.surcharge > 0 ? `+$${opt.surcharge}` : 'Free'}
              </div>
            </label>
          ))}
        </div>
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
  const { hotels, bookingDate, credits } = useApp();
  const hotel = hotels.find((h) => h.id === id);
  const [useCredits, setUseCredits] = useState(false);

  const totals = useMemo(() => {
    if (!hotel) return null;
    const p = hotel.pricing;
    const roomTypes = makeRoomTypes(hotel);
    const roomId = searchParams.get('room') || 'standard';
    const roomType = roomTypes.find((r) => r.id === roomId) || roomTypes[0];
    const adjustedFinal = Math.round(p.final * roomType.multiplier);
    const tax = Math.round(adjustedFinal * 0.14);
    const baseTotal = adjustedFinal + tax;
    const maxCredits = Math.min(credits, Math.round(baseTotal * 0.20));
    return { pricing: p, tax, baseTotal, roomType, adjustedFinal, maxCredits };
  }, [hotel, searchParams, credits]);

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
            <div className="checkout-summary">
              <span>Nightly rate</span>
              <span>${totals.adjustedFinal}</span>
            </div>
            <div className="checkout-summary">
              <span>Taxes & fees</span>
              <span>${totals.tax}</span>
            </div>
            {useCredits && totals.maxCredits > 0 && (
              <div className="checkout-summary" style={{ color: 'var(--good)' }}>
                <span>⭐ Credits applied</span>
                <span>−${totals.maxCredits}</span>
              </div>
            )}
            <div className="checkout-summary" style={{ fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 6 }}>
              <span>Total</span>
              <span>${totals.baseTotal - (useCredits ? totals.maxCredits : 0)}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--warn)', marginTop: 8 }}>
              ⭐ You'll earn ~{Math.round(totals.baseTotal * 0.05)} credits from this booking
            </div>
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
