import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const STATS = [
  { val: '200+', lbl: 'Partner hotels' },
  { val: '$4.2M', lbl: 'Extra revenue generated' },
  { val: '18 min', lbl: 'Avg. time to first booking' },
  { val: '85%', lbl: 'You keep of every booking' },
];

const HOW_IT_WORKS = [
  {
    icon: '📝',
    title: 'Apply in minutes',
    body: 'Tell us about your property, set your floor rate, and sign our partner agreement digitally — no fax machines, no lawyers required on your end.',
  },
  {
    icon: '🔗',
    title: 'We list your rooms',
    body: 'Your property goes live on NightDrop within 2 business days. Guests within miles of you see your rooms, your photos, your prices — in real time.',
  },
  {
    icon: '💸',
    title: 'Earn every night',
    body: 'Bookings land in your dashboard instantly. We remit 85% of collected revenue to your bank account within 30 days of each guest checkout — no invoicing required.',
  },
];

const COMPARISON = [
  { platform: 'NightDrop', commission: '15%', same_day: '✅', real_time: '✅', payout: '30 days' },
  { platform: 'Expedia / Hotels.com', commission: '18–22%', same_day: '❌', real_time: '❌', payout: '30–45 days' },
  { platform: 'Booking.com', commission: '15–25%', same_day: '❌', real_time: '❌', payout: '30 days' },
  { platform: 'Airbnb', commission: '3% host', same_day: '✅', real_time: '✅', payout: '1 day after checkin' },
];

const TESTIMONIALS = [
  {
    quote: "We were leaving 30 rooms empty every Friday. NightDrop fills 80% of them now. It's become a meaningful revenue line — and we set our own floor rate.",
    name: 'Margaux D.',
    title: 'Director of Revenue, Boutique Hotel Group',
  },
  {
    quote: "Setup took 20 minutes. The partner dashboard is the cleanest UI I've used from any OTA. Bookings started within 3 hours of going live.",
    name: 'Thomas R.',
    title: 'General Manager, Urban Select Hotel',
  },
  {
    quote: "Unlike the big platforms, they don't throttle your listing if you use your own PMS. It's additive, not a replacement.",
    name: 'Priya S.',
    title: 'VP of Distribution, Independent Hotel Chain',
  },
];

const FAQS = [
  {
    q: 'Is there an exclusivity requirement?',
    a: 'No. You can list on Expedia, Booking.com, or any other platform simultaneously. We only ask that your NightDrop rate is at least 10% below your best available rate after 6 PM.'
  },
  {
    q: 'What if a guest cancels?',
    a: 'Guests can cancel for free up to 4 hours before check-in. If they cancel within 4 hours, they forfeit the room charge and you receive 85% of the night\'s revenue regardless.'
  },
  {
    q: 'How do you handle no-shows?',
    a: 'We charge guests\' cards at booking. No-shows are treated like late cancellations — you keep the revenue.'
  },
  {
    q: 'What star ratings do you accept?',
    a: 'We partner with 3-star through 5-star properties. Full-service hotels, boutiques, and resorts all qualify. We don\'t list motels or properties without a front desk.'
  },
  {
    q: 'Do I need to list all my rooms?',
    a: 'No. You control exactly how many rooms enter the NightDrop pool each night via your dashboard, down to zero if you prefer.'
  },
];

function CommissionCalculator() {
  const [rooms, setRooms] = useState(20);
  const [rate, setRate] = useState(250);
  const [nights, setNights] = useState(15);

  const gross = rooms * rate * nights;
  const ourCut = Math.round(gross * 0.15);
  const yourCut = gross - ourCut;
  const perNight = Math.round(yourCut / nights);

  return (
    <div className="calc-card">
      <h3 style={{ marginTop: 0 }}>Revenue calculator</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 20px' }}>
        Estimate what NightDrop could add to your monthly revenue.
      </p>

      <div className="field">
        <label>Unsold rooms per night you'd list: <strong>{rooms}</strong></label>
        <input type="range" className="slider" min={1} max={100} value={rooms} onChange={(e) => setRooms(+e.target.value)} />
      </div>
      <div className="field">
        <label>Your average nightly rate: <strong>${rate}</strong></label>
        <input type="range" className="slider" min={79} max={999} step={5} value={rate} onChange={(e) => setRate(+e.target.value)} />
      </div>
      <div className="field">
        <label>Nights per month you'd participate: <strong>{nights}</strong></label>
        <input type="range" className="slider" min={1} max={30} value={nights} onChange={(e) => setNights(+e.target.value)} />
      </div>

      <div className="calc-results">
        <div className="calc-row">
          <span>Gross room revenue</span>
          <span>${gross.toLocaleString()}</span>
        </div>
        <div className="calc-row">
          <span>NightDrop commission (15%)</span>
          <span style={{ color: 'var(--accent)' }}>−${ourCut.toLocaleString()}</span>
        </div>
        <div className="calc-row calc-total">
          <span>You receive</span>
          <span style={{ color: 'var(--good)' }}>${yourCut.toLocaleString()}/mo</span>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
          That's ${perNight.toLocaleString()} per night you'd otherwise leave empty.
        </div>
      </div>

      <Link to="/partner-apply" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 20, padding: 14 }}>
        Start earning — apply now
      </Link>
    </div>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`} onClick={() => setOpen((v) => !v)}>
      <div className="faq-q">
        <span>{q}</span>
        <span className="faq-arrow">{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

export default function PartnerLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="partner-hero">
        <div className="partner-hero-badge">🏨 For Hotel Partners</div>
        <h1 className="partner-hero-h1">
          Turn empty rooms into<br />guaranteed revenue — every night.
        </h1>
        <p className="partner-hero-sub">
          NightDrop connects your unsold inventory with price-conscious travelers in real time.
          You set the floor. We fill the rooms. You keep 85%.
        </p>
        <div className="partner-hero-ctas">
          <Link to="/partner-apply" className="btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
            Apply to partner — free
          </Link>
          <a href="#how-it-works" className="btn-ghost" style={{ padding: '14px 24px', fontSize: 16 }}>
            See how it works
          </a>
        </div>
        <div className="partner-hero-note">No setup fee · No exclusivity · Cancel anytime</div>
      </section>

      {/* Stats */}
      <div className="partner-stats">
        {STATS.map((s) => (
          <div key={s.lbl} className="partner-stat">
            <div className="partner-stat-val">{s.val}</div>
            <div className="partner-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section id="how-it-works" style={{ marginTop: 56 }}>
        <h2 className="section-heading">How it works</h2>
        <div className="how-grid">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="how-card">
              <div className="how-icon">{step.icon}</div>
              <div className="how-step">Step {i + 1}</div>
              <h3 className="how-title">{step.title}</h3>
              <p className="how-body">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commission comparison + calculator */}
      <section style={{ marginTop: 56 }}>
        <h2 className="section-heading">Straightforward pricing</h2>
        <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: 28 }}>
          15% commission, period. No rate manipulation, no hidden fees, no throttled listings.
        </p>
        <div className="partner-split">
          <div>
            <table className="table comparison-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Commission</th>
                  <th>Same-day</th>
                  <th>Real-time</th>
                  <th>Payout</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.platform} className={row.platform === 'NightDrop' ? 'ht-row' : ''}>
                    <td style={{ fontWeight: row.platform === 'NightDrop' ? 700 : 400 }}>{row.platform}</td>
                    <td style={{ color: row.platform === 'NightDrop' ? 'var(--good)' : 'inherit' }}>{row.commission}</td>
                    <td>{row.same_day}</td>
                    <td>{row.real_time}</td>
                    <td>{row.payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
              * Commission rates based on publicly available OTA partner program terms as of 2025.
            </p>
          </div>
          <CommissionCalculator />
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ marginTop: 56 }}>
        <h2 className="section-heading">What partners say</h2>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <strong>{t.name}</strong>
                <span>{t.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginTop: 56 }}>
        <h2 className="section-heading">Common questions</h2>
        <div className="faq-list">
          {FAQS.map((f) => (
            <FAQ key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="partner-cta-banner">
        <h2>Ready to fill those rooms?</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          Apply takes less than 5 minutes. Sign digitally. Go live in 48 hours.
        </p>
        <Link to="/partner-apply" className="btn-primary" style={{ padding: '15px 40px', fontSize: 16 }}>
          Apply to partner — it's free
        </Link>
        <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13 }}>
          Already a partner?{' '}
          <Link to="/partners" style={{ color: 'var(--accent)' }}>Go to your dashboard →</Link>
        </div>
      </section>
    </>
  );
}
