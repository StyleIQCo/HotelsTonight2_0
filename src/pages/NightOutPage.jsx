import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { nightOutBundles } from '../data/nightOutBundles.js';
import { useApp } from '../store.jsx';
import {
  CATEGORIES,
  getTimeContext,
  bundleTimeStatus,
  bundleStartsIn,
  sortBundlesByTime,
} from '../lib/bundleTime.js';

const CITIES = ['All', ...Array.from(new Set(nightOutBundles.map((b) => b.city)))];

function TimeBadge({ bundle, hour }) {
  const status = bundleTimeStatus(bundle, hour);
  const startsIn = bundleStartsIn(bundle, hour);
  if (status === 'now') {
    return (
      <span className="bundle-time-badge bundle-time-now">Available now</span>
    );
  }
  if (status === 'upcoming' && startsIn) {
    return (
      <span className="bundle-time-badge bundle-time-soon">Best {startsIn}</span>
    );
  }
  if (status === 'past') {
    return (
      <span className="bundle-time-badge bundle-time-past">Earlier today</span>
    );
  }
  return null;
}

function BundleCard({ bundle, hour }) {
  const { hotels } = useApp();
  const hotel = hotels.find((h) => h.id === bundle.hotelId);
  const hotelPrice = hotel?.pricing?.final ?? 0;
  const sampleGuests = 2;
  const subtotal = hotelPrice + (bundle.dinner.pricePerPerson + bundle.experience.pricePerPerson) * sampleGuests;
  const total = subtotal - bundle.bundleSavings;
  const cat = CATEGORIES[bundle.category];
  const status = bundleTimeStatus(bundle, hour);

  return (
    <Link
      to={`/night-out/${bundle.id}`}
      className={`bundle-card${status === 'past' ? ' bundle-card-past' : ''}`}
    >
      <div className="bundle-card-img" style={{ backgroundImage: `url(${bundle.heroImage})` }}>
        <div className="bundle-card-overlay">
          <span className="bundle-cat-badge">{cat.emoji} {cat.label}</span>
          <TimeBadge bundle={bundle} hour={hour} />
        </div>
        <span className="bundle-savings-badge">Save ${bundle.bundleSavings}+</span>
      </div>

      <div className="bundle-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <div className="bundle-city-label">{bundle.city}</div>
            <div className="bundle-card-name">{bundle.name}</div>
          </div>
        </div>
        <div className="bundle-card-tagline">{bundle.tagline}</div>

        <div className="bundle-steps">
          <div className="bundle-step">
            <span className="bundle-step-icon">🏨</span>
            <span className="bundle-step-label">{hotel?.name ?? bundle.hotelId}</span>
          </div>
          <div className="bundle-step-divider">·</div>
          <div className="bundle-step">
            <span className="bundle-step-icon">{bundle.category === 'workout' ? '🏋️' : bundle.category === 'windDown' ? '🛁' : '🍽'}</span>
            <span className="bundle-step-label">{bundle.dinner.restaurant}</span>
          </div>
          <div className="bundle-step-divider">·</div>
          <div className="bundle-step">
            <span className="bundle-step-icon">🎭</span>
            <span className="bundle-step-label">{bundle.experience.name}</span>
          </div>
        </div>

        <div className="bundle-card-footer">
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 1 }}>From (2 guests)</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--good)' }}>${total}</div>
          </div>
          <div className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            Book this →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function NightOutPage() {
  const { simulatedHour } = useApp();
  const [category, setCategory] = useState('all');
  const [city, setCity] = useState('All');

  const timeCtx = useMemo(() => getTimeContext(simulatedHour), [simulatedHour]);

  const filtered = useMemo(() => {
    let list = nightOutBundles;
    if (category !== 'all') list = list.filter((b) => b.category === category);
    if (city !== 'All') list = list.filter((b) => b.city === city);
    return sortBundlesByTime(list, simulatedHour);
  }, [category, city, simulatedHour]);

  const nowBundles = useMemo(
    () => sortBundlesByTime(nightOutBundles, simulatedHour).filter((b) => bundleTimeStatus(b, simulatedHour) === 'now'),
    [simulatedHour]
  );

  return (
    <div style={{ maxWidth: 980, margin: '28px auto' }}>

      {/* Time-aware hero */}
      <div className="night-out-hero">
        <div className="night-out-hero-left">
          <div className="night-out-hero-eyebrow">
            🕐 {simulatedHour}:00 · {timeCtx.headline}
          </div>
          <h1 style={{ margin: '6px 0 8px', fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'var(--accent)' }}>Night Out</span> Bundles
          </h1>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: 15, lineHeight: 1.6, maxWidth: 480 }}>
            {timeCtx.suggestion}
          </p>
        </div>
        <Link to="/" className="btn-ghost" style={{ fontSize: 13, padding: '9px 16px', flexShrink: 0 }}>
          ← Hotel deals
        </Link>
      </div>

      {/* "Right now" callout strip */}
      {nowBundles.length > 0 && category === 'all' && city === 'All' && (
        <div className="night-out-now-strip">
          <div className="night-out-now-label">
            <span className="night-out-now-dot" />
            Available right now
          </div>
          <div className="night-out-now-names">
            {nowBundles.slice(0, 3).map((b) => (
              <Link key={b.id} to={`/night-out/${b.id}`} className="night-out-now-pill">
                {CATEGORIES[b.category].emoji} {b.name}
              </Link>
            ))}
            {nowBundles.length > 3 && (
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>+{nowBundles.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, marginTop: 20 }}>
        <button
          className={`filter-chip${category === 'all' ? ' active' : ''}`}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const count = nightOutBundles.filter((b) => b.category === key).length;
          if (count === 0) return null;
          const hasNow = nightOutBundles.some((b) => b.category === key && bundleTimeStatus(b, simulatedHour) === 'now');
          return (
            <button
              key={key}
              className={`filter-chip${category === key ? ' active' : ''}`}
              onClick={() => setCategory(key)}
              style={{ position: 'relative' }}
            >
              {cat.emoji} {cat.label}
              {hasNow && <span className="filter-chip-dot" />}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {CITIES.map((c) => (
          <button
            key={c}
            className={`filter-chip${city === c ? ' active' : ''}`}
            onClick={() => setCity(c)}
            style={{ fontSize: 12 }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Bundle grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No bundles match those filters.</p>
          <button className="btn-ghost" onClick={() => { setCategory('all'); setCity('All'); }}>
            Show all bundles
          </button>
        </div>
      ) : (
        <div className="bundle-grid">
          {filtered.map((b) => (
            <BundleCard key={b.id} bundle={b} hour={simulatedHour} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="night-out-footer">
        <p>
          All reservations confirmed instantly and non-refundable.
          Dinner times and experience tickets are guaranteed for tonight.
          Questions? <a href="mailto:hello@nightdrop.com" style={{ color: 'var(--accent)' }}>hello@nightdrop.com</a>
        </p>
      </div>
    </div>
  );
}
