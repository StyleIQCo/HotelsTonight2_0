import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { initialHotels } from './data/hotels.js';
import { initialProspects } from './data/prospects.js';
import { initialReviews, buildRatingSummaries } from './data/reviews.js';
import { priceHotel, PRICING_DEFAULTS } from './lib/pricing.js';

function seedViewerCount(hotelId) {
  const minuteBlock = Math.floor(new Date().getMinutes() / 10);
  const seed = hotelId.split('').reduce((s, c) => s + c.charCodeAt(0), 0) + minuteBlock * 7;
  return 3 + (seed % 9); // 3–11 viewers, changes every 10 min
}

const AppContext = createContext(null);
const TOAST_MS = 5000;

// `simulatedHour` lets the user "time travel" so they can see the late-check-in
// discount kick in even during the day. The Partner dashboard shows the same sim.
export function AppProvider({ children }) {
  const [hotels, setHotels] = useState(initialHotels);
  const [simulatedHour, setSimulatedHour] = useState(() => new Date().getHours());
  const [pricingConfig, setPricingConfig] = useState(PRICING_DEFAULTS);
  const [bookingDate, setBookingDate] = useState('tonight'); // 'tonight' | 'tomorrow'
  const [userLocation, setUserLocation] = useState(null);
  const [bookings, setBookings] = useState([]); // [{ id, hotelId, guestName, priceUSD, createdAt }]
  const [toasts, setToasts] = useState([]);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const lastAlertedRef = useRef(new Set()); // hotelIds we've already alerted on

  // Real-time minute tracking for countdown timers (updates every 30s)
  const [realMinute, setRealMinute] = useState(() => new Date().getMinutes());
  useEffect(() => {
    const t = setInterval(() => setRealMinute(new Date().getMinutes()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Favorites persisted to localStorage
  const [favorites, setFavorites] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ht_favorites') || '[]')); }
    catch { return new Set(); }
  });
  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('ht_favorites', JSON.stringify([...next]));
      return next;
    });
  }

  // Build a "now" that reflects the simulated hour (for consistent pricing).
  const now = useMemo(() => {
    const d = new Date();
    d.setHours(simulatedHour, 0, 0, 0);
    return d;
  }, [simulatedHour]);

  // Compute priced hotels reactively.
  const pricedHotels = useMemo(
    () => hotels.map((h) => ({ ...h, pricing: priceHotel(h, now, pricingConfig, bookingDate === 'tomorrow') })),
    [hotels, now, pricingConfig, bookingDate]
  );

  // Price alert engine: fire toast when a hotel price drops to / below target
  const alertedRef = useRef(new Set());
  useEffect(() => {
    for (const alert of priceAlerts) {
      const hotel = pricedHotels.find((h) => h.id === alert.hotelId);
      if (!hotel) continue;
      const key = `${alert.hotelId}:${alert.targetPrice}`;
      if (hotel.pricing.final <= alert.targetPrice && !alertedRef.current.has(key)) {
        alertedRef.current.add(key);
        pushToast({
          title: `🎯 Price alert: ${hotel.name}`,
          body: `Now $${hotel.pricing.final}/night — your target was $${alert.targetPrice}. Book now!`,
        });
      }
      if (hotel.pricing.final > alert.targetPrice) {
        alertedRef.current.delete(key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricedHotels, priceAlerts]);

  // Marketing / notification engine: when a hotel crosses a 25% total discount
  // threshold we haven't alerted on yet, fire a toast.
  useEffect(() => {
    if (!notificationsOn) return;
    for (const h of pricedHotels) {
      if (h.pricing.totalPct >= 0.25 && !lastAlertedRef.current.has(h.id)) {
        lastAlertedRef.current.add(h.id);
        pushToast({
          title: `${Math.round(h.pricing.totalPct * 100)}% OFF at ${h.name}`,
          body: `${h.neighborhood} — tonight only. $${h.pricing.final}/night.`
        });
      }
      if (h.pricing.totalPct < 0.2 && lastAlertedRef.current.has(h.id)) {
        lastAlertedRef.current.delete(h.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricedHotels, notificationsOn]);

  function pushToast(t) {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), TOAST_MS);
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function updateHotel(id, patch) {
    setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }

  function recordBooking(booking) {
    const creditsEarned = Math.round(booking.priceUSD * 0.05);
    setBookings((prev) => [
      { ...booking, createdAt: new Date().toISOString(), creditsEarned, reviewed: false },
      ...prev,
    ]);
    earnCredits(creditsEarned);
    // Reduce vacancy slightly to simulate inventory moving.
    setHotels((prev) =>
      prev.map((h) =>
        h.id === booking.hotelId
          ? { ...h, vacancyRate: Math.max(0, h.vacancyRate - 0.05) }
          : h
      )
    );
  }

  // Prospect CRM — real hotel targets for partnership outreach
  const [prospects, setProspects] = useState(initialProspects);
  function updateProspect(id, patch) {
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function addOutreach(prospectId, entry) {
    setProspects((prev) =>
      prev.map((p) =>
        p.id === prospectId
          ? { ...p, outreach: [{ ...entry, date: new Date().toISOString() }, ...p.outreach] }
          : p
      )
    );
  }

  // Reviews — seeded from data, users can add after booking
  const [reviews, setReviews] = useState(initialReviews);
  const ratingSummaries = useMemo(() => buildRatingSummaries(reviews), [reviews]);

  function addReview(review) {
    const id = `r_user_${Math.random().toString(36).slice(2, 9)}`;
    setReviews((prev) => [{ ...review, id }, ...prev]);
  }

  function markBookingReviewed(bookingId) {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, reviewed: true } : b)));
  }

  // NightDrop Credits — loyalty points earned at 5% of booking value
  const [credits, setCredits] = useState(() => {
    try { return parseInt(localStorage.getItem('nd_credits') || '0', 10); }
    catch { return 0; }
  });

  function earnCredits(amount) {
    setCredits((prev) => {
      const next = prev + amount;
      localStorage.setItem('nd_credits', String(next));
      return next;
    });
  }

  function spendCredits(amount) {
    setCredits((prev) => {
      const next = Math.max(0, prev - amount);
      localStorage.setItem('nd_credits', String(next));
      return next;
    });
  }

  // Price alerts — notify when a hotel's price drops to or below a target
  const [priceAlerts, setPriceAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nd_alerts') || '[]'); }
    catch { return []; }
  });

  function addPriceAlert(hotelId, targetPrice) {
    setPriceAlerts((prev) => {
      const next = [...prev.filter((a) => a.hotelId !== hotelId), { hotelId, targetPrice, createdAt: new Date().toISOString() }];
      localStorage.setItem('nd_alerts', JSON.stringify(next));
      return next;
    });
  }

  function removePriceAlert(hotelId) {
    setPriceAlerts((prev) => {
      const next = prev.filter((a) => a.hotelId !== hotelId);
      localStorage.setItem('nd_alerts', JSON.stringify(next));
      return next;
    });
  }

  // Partner leads — captured via the /partner-apply flow
  const [leads, setLeads] = useState([]);
  function addLead(lead) {
    const id = Math.random().toString(36).slice(2, 9).toUpperCase();
    setLeads((prev) => [
      { ...lead, id, submittedAt: new Date().toISOString(), status: 'new' },
      ...prev,
    ]);
    return id;
  }

  const value = {
    hotels: pricedHotels,
    bookingDate,
    setBookingDate,
    reviews,
    ratingSummaries,
    addReview,
    markBookingReviewed,
    credits,
    earnCredits,
    spendCredits,
    priceAlerts,
    addPriceAlert,
    removePriceAlert,
    rawHotels: hotels,
    updateHotel,
    now,
    simulatedHour,
    setSimulatedHour,
    pricingConfig,
    setPricingConfig,
    userLocation,
    setUserLocation,
    bookings,
    recordBooking,
    toasts,
    pushToast,
    dismissToast,
    notificationsOn,
    setNotificationsOn,
    realMinute,
    favorites,
    toggleFavorite,
    viewerCount: seedViewerCount,
    leads,
    addLead,
    prospects,
    updateProspect,
    addOutreach,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
