import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HotelCard from '../components/HotelCard.jsx';
import FilterBar from '../components/FilterBar.jsx';
import TimeSimulator from '../components/TimeSimulator.jsx';
import HotelMap from '../components/HotelMap.jsx';
import { useApp } from '../store.jsx';
import { distanceMiles } from '../lib/pricing.js';
import { getBrowserLocation } from '../lib/geolocation.js';

function CountdownPill({ simulatedHour, realMinute, pricingConfig }) {
  const { primeTimeHour, cutoffHour } = pricingConfig;
  if (simulatedHour >= cutoffHour) {
    return <span className="countdown-badge countdown-best">★ Peak discount — best rate of the night</span>;
  }
  if (simulatedHour < primeTimeHour) {
    const totalMins = (primeTimeHour - simulatedHour) * 60 - realMinute;
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const str = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return <span className="countdown-badge countdown-pending">⏳ Deals start in {str}</span>;
  }
  const minsLeft = 60 - realMinute;
  return <span className="countdown-badge countdown-live">⚡ Discount increases in {minsLeft}m</span>;
}

function SecretCard({ hotel }) {
  const discountPct = hotel.topSecretDiscount ?? hotel.pricing.totalPct;
  const price = Math.round(hotel.rackRate * (1 - discountPct));
  const savings = hotel.rackRate - price;
  const cityOnly = hotel.neighborhood.split(',').slice(-1)[0].trim();

  return (
    <Link to={`/secret/${hotel.id}`} className="secret-card">
      <div className="secret-img" style={{ backgroundImage: `url(${hotel.image})` }} />
      <div className="secret-overlay">
        <span className="secret-badge">🔒 TOP SECRET</span>
        <div className="secret-card-stars">{'★'.repeat(hotel.stars)}</div>
        <div className="secret-card-city">{cityOnly}</div>
        <div className="secret-card-discount">{Math.round(discountPct * 100)}% OFF</div>
        <div className="secret-card-price">
          ${price}<span className="per-night"> /night</span>
        </div>
        <div className="secret-card-was">was ${hotel.rackRate} — save ${savings}</div>
        <div className="btn-primary secret-reveal-cta">Reveal & Book →</div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { hotels, userLocation, setUserLocation, simulatedHour, realMinute, pricingConfig } = useApp();
  const [locating, setLocating] = useState(false);
  const [locationAsked, setLocationAsked] = useState(false);

  // Filter/sort state
  const [sortBy, setSortBy] = useState('deal');
  const [minStars, setMinStars] = useState(0);
  const [favsOnly, setFavsOnly] = useState(false);
  const { favorites } = useApp();

  useEffect(() => {
    if (!locationAsked && !userLocation) {
      setLocationAsked(true);
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestLocation() {
    setLocating(true);
    const loc = await getBrowserLocation();
    setUserLocation(loc);
    setLocating(false);
  }

  const annotated = useMemo(() => {
    return hotels.map((h) => ({
      ...h,
      distanceMi: userLocation ? distanceMiles(userLocation, { lat: h.lat, lng: h.lng }) : null
    }));
  }, [hotels, userLocation]);

  // Separate top-secret hotels from the main grid
  const secretHotels = useMemo(() => annotated.filter((h) => h.topSecret), [annotated]);

  const regularHotels = useMemo(() => annotated.filter((h) => !h.topSecret), [annotated]);

  // Apply filters + sort to regular hotels
  const filtered = useMemo(() => {
    let list = [...regularHotels];
    if (minStars > 0) list = list.filter((h) => h.stars >= minStars);
    if (favsOnly) list = list.filter((h) => favorites.has(h.id));
    switch (sortBy) {
      case 'price':
        list.sort((a, b) => a.pricing.final - b.pricing.final);
        break;
      case 'stars':
        list.sort((a, b) => b.stars - a.stars || b.pricing.totalPct - a.pricing.totalPct);
        break;
      case 'distance':
        list.sort((a, b) => {
          if (a.distanceMi != null && b.distanceMi != null) return a.distanceMi - b.distanceMi;
          return b.pricing.totalPct - a.pricing.totalPct;
        });
        break;
      default: // 'deal'
        list.sort((a, b) => b.pricing.totalPct - a.pricing.totalPct);
    }
    return list;
  }, [regularHotels, sortBy, minStars, favsOnly, favorites]);

  const bestDeal = [...annotated].sort((a, b) => b.pricing.totalPct - a.pricing.totalPct)[0];
  const isAfterPrime = simulatedHour >= pricingConfig.primeTimeHour;

  return (
    <>
      <section className="hero">
        <span className="hero-pill">
          {isAfterPrime ? '🔥 Prime-time is over — deals are live' : '⏰ Prices drop after 6:00 PM'}
        </span>
        <h1>Last-minute rooms, tonight.</h1>
        <p>
          We partner with hotels that still have rooms and pass the savings straight to you.
          The later you book, the more you save.
        </p>
        <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={requestLocation} disabled={locating}>
            {locating ? 'Finding you…' : userLocation ? '📍 Using your location' : '📍 Use my location'}
          </button>
          <a className="btn-ghost" href="#deals">See tonight's deals</a>
        </div>
        <div style={{ marginTop: 14 }}>
          <CountdownPill simulatedHour={simulatedHour} realMinute={realMinute} pricingConfig={pricingConfig} />
        </div>
      </section>

      <TimeSimulator />

      {bestDeal && bestDeal.pricing.totalPct > 0.15 && (
        <div className="deal-banner">
          <div className="deal-banner-text">
            <strong>Tonight's biggest drop: {Math.round(bestDeal.pricing.totalPct * 100)}% off</strong>
            <span style={{ color: 'var(--muted)' }}>
              {bestDeal.name} · ${bestDeal.pricing.final}/night (was ${bestDeal.pricing.rack})
            </span>
          </div>
          <a className="btn-primary" href={`/hotel/${bestDeal.id}`}>Grab it</a>
        </div>
      )}

      {/* Top Secret Deals */}
      {secretHotels.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 32 }}>
            <h2>🔒 Top Secret Deals</h2>
            <small>Hotel revealed after you tap — save 40%+</small>
          </div>
          <div className="secret-grid">
            {secretHotels.map((h) => (
              <SecretCard key={h.id} hotel={h} />
            ))}
          </div>
        </>
      )}

      <div className="section-title" id="map" style={{ marginTop: 32 }}>
        <h2>On the map</h2>
        <small>Tap a pin to see the rate and drive there</small>
      </div>
      <HotelMap hotels={filtered} userLocation={userLocation} height={380} />

      <div className="section-title" id="deals" style={{ marginTop: 28 }}>
        <h2>{userLocation ? 'Near you tonight' : 'Tonight across the country'}</h2>
        <small>{annotated.length} partner hotels with rooms right now</small>
      </div>

      <FilterBar
        sortBy={sortBy} setSortBy={setSortBy}
        minStars={minStars} setMinStars={setMinStars}
        favsOnly={favsOnly} setFavsOnly={setFavsOnly}
        resultCount={filtered.length}
      />

      <div className="hotel-grid">
        {filtered.map((h) => (
          <HotelCard key={h.id} hotel={h} distanceMi={h.distanceMi} />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <p>No hotels match your filters.</p>
            <button className="btn-ghost" onClick={() => { setMinStars(0); setFavsOnly(false); }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
