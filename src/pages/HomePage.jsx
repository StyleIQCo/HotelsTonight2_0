import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HotelCard from '../components/HotelCard.jsx';
import FilterBar, { hotelMatchesAmenity } from '../components/FilterBar.jsx';
import TimeSimulator from '../components/TimeSimulator.jsx';
import HotelMap from '../components/HotelMap.jsx';
import { useApp } from '../store.jsx';
import { distanceMiles } from '../lib/pricing.js';
import { getBrowserLocation } from '../lib/geolocation.js';
import { nightOutBundles } from '../data/nightOutBundles.js';
import { featuredBundlesForTime, getTimeContext, CATEGORIES } from '../lib/bundleTime.js';

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

const ARRIVAL_WINDOWS_HOME = [
  { id: 'any',       emoji: '⏰', label: 'Any time' },
  { id: 'evening',   emoji: '🌆', label: '7–10 PM',      minHour: 22, save: '$10' },
  { id: 'night',     emoji: '🌙', label: 'After 10 PM',   minHour: 25, save: '$20' },
  { id: 'latenight', emoji: '🌃', label: 'After midnight', minHour: 25, save: '$25' },
];

function ArrivalPicker({ arrivalWindow, setArrivalWindow }) {
  return (
    <div className="arrival-hero-picker">
      <span className="arrival-hero-label">Arriving when?</span>
      <div className="arrival-hero-chips">
        {ARRIVAL_WINDOWS_HOME.map((w) => (
          <button
            key={w.id}
            className={`arrival-hero-chip${arrivalWindow === w.id ? ' active' : ''}`}
            onClick={() => setArrivalWindow(w.id)}
          >
            {w.emoji} {w.label}
            {w.save && <span className="arrival-chip-save"> −{w.save}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function DateToggle({ bookingDate, setBookingDate }) {
  return (
    <div className="date-toggle">
      <button
        className={`date-toggle-btn${bookingDate === 'tonight' ? ' active' : ''}`}
        onClick={() => setBookingDate('tonight')}
      >
        🌙 Tonight
      </button>
      <button
        className={`date-toggle-btn${bookingDate === 'tomorrow' ? ' active' : ''}`}
        onClick={() => setBookingDate('tomorrow')}
      >
        ☀️ Tomorrow
      </button>
    </div>
  );
}

export default function HomePage() {
  const {
    hotels, userLocation, setUserLocation,
    simulatedHour, realMinute, pricingConfig,
    bookingDate, setBookingDate,
    favorites, walkInMode, flashDrops,
  } = useApp();

  const [locating, setLocating] = useState(false);
  const [locationAsked, setLocationAsked] = useState(false);
  const [arrivalWindow, setArrivalWindow] = useState('any');

  // Filter/sort state
  const [sortBy, setSortBy] = useState('deal');
  const [minStars, setMinStars] = useState(0);
  const [favsOnly, setFavsOnly] = useState(false);
  const [amenities, setAmenities] = useState([]);

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

  const secretHotels = useMemo(() => annotated.filter((h) => h.topSecret), [annotated]);
  const regularHotels = useMemo(() => annotated.filter((h) => !h.topSecret), [annotated]);

  const filtered = useMemo(() => {
    let list = [...regularHotels];
    if (minStars > 0) list = list.filter((h) => h.stars >= minStars);
    if (favsOnly) list = list.filter((h) => favorites.has(h.id));
    if (amenities.length > 0)
      list = list.filter((h) => amenities.every((a) => hotelMatchesAmenity(h, a)));
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
      default:
        list.sort((a, b) => b.pricing.totalPct - a.pricing.totalPct);
    }
    return list;
  }, [regularHotels, sortBy, minStars, favsOnly, amenities, favorites]);

  const bestDeal = [...annotated].sort((a, b) => b.pricing.totalPct - a.pricing.totalPct)[0];
  const isAfterPrime = simulatedHour >= pricingConfig.primeTimeHour;

  return (
    <>
      <section className="hero">
        <span className="hero-pill">
          {isAfterPrime ? '🔥 Prime-time is over — deals are live' : '⏰ Prices drop after 6:00 PM'}
        </span>
        <h1>Book now. Arrive whenever.</h1>
        <p>
          Hotel hunting after work, a flight, or a late dinner? Every room is guaranteed
          until the early hours — and arriving late means paying less.
        </p>

        <DateToggle bookingDate={bookingDate} setBookingDate={setBookingDate} />

        {bookingDate === 'tonight' && (
          <ArrivalPicker arrivalWindow={arrivalWindow} setArrivalWindow={setArrivalWindow} />
        )}

        <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={requestLocation} disabled={locating}>
            {locating ? 'Finding you…' : userLocation ? '📍 Using your location' : '📍 Use my location'}
          </button>
          <a className="btn-ghost" href="#deals">See {bookingDate === 'tomorrow' ? "tomorrow's" : "tonight's"} deals</a>
        </div>
        {bookingDate === 'tonight' && (
          <div style={{ marginTop: 14 }}>
            <CountdownPill simulatedHour={simulatedHour} realMinute={realMinute} pricingConfig={pricingConfig} />
          </div>
        )}
        {bookingDate === 'tomorrow' && (
          <div style={{ marginTop: 14 }}>
            <span className="countdown-badge countdown-pending">
              ☀️ Tomorrow's rates — vacancy discounts apply, late-arrival savings don't
            </span>
          </div>
        )}
      </section>

      {/* Walk-in mode banner */}
      {walkInMode && bookingDate === 'tonight' && (
        <div className="walkin-banner">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>📍 You're nearby — Walk-in Mode</div>
            <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', marginTop: 2 }}>
              Hotels within walking distance shown first. Book now and check in within minutes.
            </div>
          </div>
        </div>
      )}

      <TimeSimulator />

      {bestDeal && bestDeal.pricing.totalPct > 0.15 && bookingDate === 'tonight' && (
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

      {/* Late Arrival feature strip — shown when user selects an evening/night arrival */}
      {bookingDate === 'tonight' && arrivalWindow !== 'any' && (() => {
        const windowInfo = ARRIVAL_WINDOWS_HOME.find((w) => w.id === arrivalWindow);
        const lateHotels = annotated
          .filter((h) => h.latestCheckInHour && (arrivalWindow === 'latenight' ? h.latestCheckInHour >= 26 : h.latestCheckInHour >= 25))
          .sort((a, b) => b.pricing.totalPct - a.pricing.totalPct)
          .slice(0, 4);
        return (
          <>
            <div className="late-arrival-banner">
              <div className="late-arrival-banner-left">
                <span style={{ fontSize: 22 }}>{windowInfo.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Late Arrival Deals — arriving {windowInfo.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    Your Late Drop discount of <strong>{windowInfo.save}</strong> applies at checkout. Room guaranteed until late.
                  </div>
                </div>
              </div>
              <button className="btn-ghost" style={{ fontSize: 13, flexShrink: 0, borderColor: 'rgba(255,255,255,0.3)', color: 'white' }} onClick={() => setArrivalWindow('any')}>
                Clear
              </button>
            </div>
            {lateHotels.length > 0 && (
              <div className="late-hotel-strip">
                {lateHotels.map((h) => (
                  <Link key={h.id} to={`/hotel/${h.id}`} className="late-hotel-card">
                    <div className="late-hotel-img" style={{ backgroundImage: `url(${h.image})` }}>
                      <span className="late-hotel-discount">{Math.round(h.pricing.totalPct * 100)}% OFF</span>
                    </div>
                    <div className="late-hotel-body">
                      <div className="late-hotel-name">{h.name}</div>
                      <div className="late-hotel-neighborhood">{h.neighborhood}</div>
                      <div className="late-hotel-checkin">🌙 Until {h.latestCheckIn}</div>
                      <div className="late-hotel-price">
                        <span style={{ textDecoration: 'line-through', color: 'var(--muted)', fontSize: 12 }}>${h.pricing.rack}</span>
                        {' '}
                        <strong>${h.pricing.final}</strong>
                        <span style={{ color: 'var(--good)', fontSize: 12 }}> −{windowInfo.save} Late Drop</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        );
      })()}

      {/* Top Secret Deals — only shown for tonight */}
      {secretHotels.length > 0 && bookingDate === 'tonight' && (
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

      {/* Night Out Bundles — time-aware featured strip, tonight only */}
      {bookingDate === 'tonight' && (() => {
        const timeCtx = getTimeContext(simulatedHour);
        const featured = featuredBundlesForTime(nightOutBundles, simulatedHour, 4);
        return (
          <>
            <div className="section-title" style={{ marginTop: 36 }}>
              <div>
                <h2 style={{ margin: 0 }}>🎭 Night Out Bundles</h2>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{timeCtx.sub}</div>
              </div>
              <Link to="/night-out" style={{ fontSize: 13, color: 'var(--accent)' }}>See all →</Link>
            </div>
            <div className="bundle-strip">
              {featured.map((bundle) => {
                const h = annotated.find((x) => x.id === bundle.hotelId);
                const hotelPrice = h?.pricing?.final ?? 0;
                const sampleTotal = hotelPrice + (bundle.dinner.pricePerPerson + bundle.experience.pricePerPerson) * 2 - bundle.bundleSavings;
                const cat = CATEGORIES[bundle.category];
                return (
                  <Link key={bundle.id} to={`/night-out/${bundle.id}`} className="bundle-strip-card">
                    <div className="bundle-strip-img" style={{ backgroundImage: `url(${bundle.heroImage})` }}>
                      <span className="bundle-strip-savings">Save ${bundle.bundleSavings}+</span>
                      <span className="bundle-strip-cat">{cat.emoji} {cat.label}</span>
                    </div>
                    <div className="bundle-strip-body">
                      <div className="bundle-strip-city">{bundle.city}</div>
                      <div className="bundle-strip-name">{bundle.name}</div>
                      <div className="bundle-strip-meta">
                        {bundle.dinner.restaurant} · {bundle.experience.name}
                      </div>
                      <div className="bundle-strip-price">
                        From ${sampleTotal}{' '}
                        <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11 }}>/ 2 guests</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        );
      })()}

      <div className="section-title" id="map" style={{ marginTop: 32 }}>
        <h2>On the map</h2>
        <small>Tap a pin to see the rate and drive there</small>
      </div>
      <HotelMap hotels={filtered} userLocation={userLocation} height={380} />

      <div className="section-title" id="deals" style={{ marginTop: 28 }}>
        <h2>
          {bookingDate === 'tomorrow'
            ? (userLocation ? 'Near you tomorrow' : 'Tomorrow across the country')
            : arrivalWindow !== 'any'
              ? `${ARRIVAL_WINDOWS_HOME.find((w) => w.id === arrivalWindow)?.emoji} Late arrival picks`
              : (userLocation ? 'Near you tonight' : 'Tonight across the country')}
        </h2>
        <small>
          {arrivalWindow !== 'any' && bookingDate === 'tonight'
            ? `All ${annotated.length} hotels hold your room until at least 1:00 AM`
            : `${annotated.length} partner hotels with rooms right now`}
        </small>
      </div>

      <FilterBar
        sortBy={sortBy} setSortBy={setSortBy}
        minStars={minStars} setMinStars={setMinStars}
        favsOnly={favsOnly} setFavsOnly={setFavsOnly}
        amenities={amenities} setAmenities={setAmenities}
        resultCount={filtered.length}
      />

      <div className="hotel-grid">
        {filtered.map((h) => (
          <HotelCard key={h.id} hotel={h} distanceMi={h.distanceMi} />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <p>No hotels match your filters.</p>
            <button className="btn-ghost" onClick={() => { setMinStars(0); setFavsOnly(false); setAmenities([]); }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
