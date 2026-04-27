import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { nightOutBundles } from '../data/nightOutBundles.js';
import { useApp } from '../store.jsx';

function ItineraryStep({ time, icon, title, subtitle, address }) {
  return (
    <div className="itinerary-step">
      <div className="itinerary-step-time">{time}</div>
      <div className="itinerary-step-dot" />
      <div className="itinerary-step-body">
        <div className="itinerary-step-icon">{icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{subtitle}</div>
          {address && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>📍 {address}</div>}
        </div>
      </div>
    </div>
  );
}

export default function BundleCheckoutPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { hotels, bookBundle } = useApp();

  const bundle = nightOutBundles.find((b) => b.id === id);
  const hotel = bundle ? hotels.find((h) => h.id === bundle.hotelId) : null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState(2);
  const [dinnerTime, setDinnerTime] = useState(bundle?.dinner.timeSlots[0] ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState(null);

  if (!bundle) {
    return (
      <div className="empty-state">
        <p>Bundle not found.</p>
        <Link to="/night-out" className="btn-ghost">Browse Night Out</Link>
      </div>
    );
  }

  const hotelPrice = hotel?.pricing?.final ?? 0;
  const dinnerTotal = bundle.dinner.pricePerPerson * guests;
  const experienceTotal = bundle.experience.pricePerPerson * guests;
  const subtotal = hotelPrice + dinnerTotal + experienceTotal;
  const total = subtotal - bundle.bundleSavings;
  const creditsPreview = Math.round(total * 0.05);

  async function handleBook(e) {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    const bookingId = bookBundle(bundle, hotelPrice, name, email, guests, dinnerTime, total);
    setDoneId(bookingId);
    setSubmitting(false);
  }

  if (doneId) {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }}>
        <div className="detail-card" style={{ padding: 40 }}>
          <div style={{ fontSize: 52 }}>🎉</div>
          <h2 style={{ margin: '14px 0 6px' }}>Your night is booked!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
            Confirmation sent to <strong>{email}</strong>. Here is your evening:
          </p>

          <div style={{ textAlign: 'left', marginBottom: 24 }}>
            <ItineraryStep time="3:00 PM" icon="🏨" title={hotel?.name ?? bundle.hotelId} subtitle="Check-in" address={hotel?.neighborhood} />
            <ItineraryStep time={dinnerTime} icon="🍽" title={bundle.dinner.restaurant} subtitle={bundle.dinner.cuisine} address={bundle.dinner.address} />
            <ItineraryStep time={bundle.experience.time} icon="🎭" title={bundle.experience.name} subtitle={bundle.experience.type} address={bundle.experience.venue} />
          </div>

          <div style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 24, fontSize: 14, color: 'var(--warn)' }}>
            ⭐ +{creditsPreview} NightDrop Credits added to your account
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/my-bookings" className="btn-primary">View my bookings</Link>
            <Link to="/night-out" className="btn-ghost">Browse more bundles</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '28px auto' }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/night-out" style={{ color: 'var(--muted)', fontSize: 13 }}>← Night Out Bundles</Link>
      </div>
      <h2 style={{ marginBottom: 4 }}>{bundle.name}</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>{bundle.tagline}</p>

      <div className="detail-grid">
        {/* Left: form + itinerary */}
        <div>
          {/* Itinerary timeline */}
          <div className="detail-card" style={{ marginBottom: 20, padding: '18px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Your evening itinerary</div>
            <div className="itinerary-timeline">
              <ItineraryStep time="3:00 PM" icon="🏨" title={hotel?.name ?? bundle.hotelId} subtitle="Hotel check-in" address={hotel?.neighborhood} />
              <ItineraryStep time={dinnerTime || bundle.dinner.timeSlots[0]} icon="🍽" title={bundle.dinner.restaurant} subtitle={bundle.dinner.cuisine} address={bundle.dinner.address} />
              <ItineraryStep time={bundle.experience.time} icon="🎭" title={bundle.experience.name} subtitle={`${bundle.experience.type} · ${bundle.experience.duration}`} address={bundle.experience.venue} />
            </div>
          </div>

          {/* Booking form */}
          <form className="detail-card" onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Your details</div>

            <div className="field">
              <label htmlFor="b-name">Full name</label>
              <input id="b-name" className="input" placeholder="For hotel check-in and reservations" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="b-email">Email</label>
              <input id="b-email" className="input" type="email" placeholder="Confirmation sent here" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label htmlFor="b-guests">Party size</label>
                <select
                  id="b-guests"
                  className="input"
                  value={guests}
                  onChange={(e) => setGuests(+e.target.value)}
                >
                  {Array.from({ length: bundle.maxGuests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="b-time">Dinner time</label>
                <select
                  id="b-time"
                  className="input"
                  value={dinnerTime}
                  onChange={(e) => setDinnerTime(e.target.value)}
                >
                  {bundle.dinner.timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ background: 'rgba(55,214,160,0.07)', border: '1px solid rgba(55,214,160,0.2)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              🔒 Booking is confirmed instantly and non-refundable. All three components — hotel, dinner, and experience — are reserved in your name.
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: 14, fontSize: 15 }}
              disabled={submitting || !name || !email}
            >
              {submitting ? 'Booking your night…' : `Book this night — $${total}`}
            </button>
          </form>
        </div>

        {/* Right: price summary sidebar */}
        <aside>
          <div className="detail-card">
            {/* Hero image */}
            <div
              style={{
                height: 150, borderRadius: 10, marginBottom: 14,
                backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundImage: `url(${bundle.heroImage})`,
              }}
            />

            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{bundle.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>{bundle.city}</div>

            {/* Component breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div className="bundle-summary-row">
                <div className="bundle-summary-icon">🏨</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{hotel?.name ?? 'Hotel'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>1 night · {hotel?.stars}★</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>${hotelPrice}</div>
              </div>

              <div className="bundle-summary-row">
                <div className="bundle-summary-icon">🍽</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{bundle.dinner.restaurant}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{bundle.dinner.cuisine} · ${bundle.dinner.pricePerPerson}/person</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>${dinnerTotal}</div>
              </div>

              <div className="bundle-summary-row">
                <div className="bundle-summary-icon">🎭</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{bundle.experience.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{bundle.experience.type} · ${bundle.experience.pricePerPerson}/person</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>${experienceTotal}</div>
              </div>
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div className="checkout-summary">
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Subtotal ({guests} {guests === 1 ? 'guest' : 'guests'})</span>
                <span style={{ fontSize: 13 }}>${subtotal}</span>
              </div>
              <div className="checkout-summary" style={{ color: 'var(--good)' }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Bundle savings</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>−${bundle.bundleSavings}</span>
              </div>
              <div className="checkout-summary" style={{ fontWeight: 800, fontSize: 18, marginTop: 6 }}>
                <span>Total</span>
                <span style={{ color: 'var(--good)' }}>${total}</span>
              </div>
            </div>

            {/* Credits preview */}
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,184,77,0.08)', border: '1px solid rgba(255,184,77,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--warn)' }}>
              ⭐ You will earn ~{creditsPreview} NightDrop Credits from this bundle
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
