import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { initialHotels } from './data/hotels.js';
import { initialProspects } from './data/prospects.js';
import { initialReviews, buildRatingSummaries } from './data/reviews.js';
import { seedTransfers } from './data/seedTransfers.js';
import { priceHotel, PRICING_DEFAULTS, distanceMiles } from './lib/pricing.js';
import { getTier, getCreditsRate } from './lib/loyalty.js';

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
  const [bookingDate, setBookingDate] = useState('tonight');
  const [userLocation, setUserLocation] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const lastAlertedRef = useRef(new Set());

  // ── Auth ──────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nd_user') || 'null'); } catch { return null; }
  });
  const [showAuth, setShowAuth] = useState(false);

  // ── Groups ────────────────────────────────────────────────────────
  const [groups, setGroups] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nd_groups') || '[]'); } catch { return []; }
  });

  // ── Price Locks ───────────────────────────────────────────────────
  const [priceLocks, setPriceLocks] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('nd_price_locks') || '[]');
      return raw.filter((l) => new Date(l.expiresAt) > new Date());
    } catch { return []; }
  });

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

  // ── Flash Drops — 2 hotels discounted extra 15% during first 30 min of each hour
  const flashDrops = useMemo(() => {
    if (realMinute >= 30) return [];
    const eligible = pricedHotels.filter((h) => !h.topSecret);
    if (eligible.length < 2) return [];
    const seed = simulatedHour * 31 + 7;
    const scored = eligible.map((h) => ({
      hotel: h,
      score: h.id.split('').reduce((s, c, i) => s + c.charCodeAt(0) * (seed + i * 3), 0) % 1000,
    })).sort((a, b) => b.score - a.score);
    return scored.slice(0, 2).map(({ hotel }) => ({
      hotelId: hotel.id,
      hotelName: hotel.name,
      extraDiscount: 0.15,
      minutesLeft: 30 - realMinute,
      flashPrice: Math.round(hotel.pricing.final * 0.85),
    }));
  }, [pricedHotels, simulatedHour, realMinute]);

  // ── Loyalty tier — computed from total spend across all bookings
  const totalSpend = useMemo(() => bookings.reduce((s, b) => s + (b.priceUSD || 0), 0), [bookings]);
  const tier = useMemo(() => getTier(totalSpend), [totalSpend]);

  // ── Walk-in mode — user is physically near hotels
  const walkInMode = useMemo(() => {
    if (!userLocation) return false;
    return pricedHotels.some((h) => h.lat && h.lng && distanceMiles(userLocation, { lat: h.lat, lng: h.lng }) < 5);
  }, [userLocation, pricedHotels]);

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

  // ── Auth functions ────────────────────────────────────────────────
  function signUp(name, email, referralCode) {
    const id = `u_${Math.random().toString(36).slice(2, 9)}`;
    const code = `${name.split(' ')[0].toUpperCase().slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser = { id, name, email, referralCode: code, joinedAt: new Date().toISOString() };
    setUser(newUser);
    localStorage.setItem('nd_user', JSON.stringify(newUser));
    setShowAuth(false);
    earnCredits(100);
    if (referralCode) earnCredits(100);
    pushToast({ title: `Welcome, ${name}! 🎉`, body: `+${referralCode ? 200 : 100} welcome credits added.` });
    return newUser;
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem('nd_user');
  }

  // ── Groups ────────────────────────────────────────────────────────
  function createGroup(data) {
    const id = `grp_${Math.random().toString(36).slice(2, 9)}`;
    const group = {
      ...data, id,
      createdAt: new Date().toISOString(),
      members: [{ name: data.organizerName, email: data.organizerEmail, status: 'confirmed', joinedAt: new Date().toISOString() }],
    };
    setGroups((prev) => {
      const next = [group, ...prev];
      localStorage.setItem('nd_groups', JSON.stringify(next));
      return next;
    });
    return id;
  }

  function joinGroup(groupId, name, email) {
    setGroups((prev) => {
      const next = prev.map((g) => g.id !== groupId ? g : {
        ...g,
        members: [...g.members.filter((m) => m.email !== email), { name, email, status: 'confirmed', joinedAt: new Date().toISOString() }],
      });
      localStorage.setItem('nd_groups', JSON.stringify(next));
      return next;
    });
  }

  // ── Price locks ───────────────────────────────────────────────────
  function lockPrice(hotelId, price) {
    const id = `lock_${Math.random().toString(36).slice(2, 9)}`;
    const hotel = pricedHotels.find((h) => h.id === hotelId);
    const isFree = tier === 'silver' || tier === 'gold' || tier === 'platinum';
    const lock = { id, hotelId, price, deposit: isFree ? 0 : 10, lockedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() };
    setPriceLocks((prev) => {
      const next = [...prev.filter((l) => l.hotelId !== hotelId), lock];
      localStorage.setItem('nd_price_locks', JSON.stringify(next));
      return next;
    });
    pushToast({ title: '🔒 Rate locked for 2 hours', body: `$${price}/night at ${hotel?.name}. ${isFree ? 'Free with your tier!' : '$10 deposit applied at checkout.'}` });
  }

  function getActiveLock(hotelId) {
    return priceLocks.find((l) => l.hotelId === hotelId && new Date(l.expiresAt) > new Date()) || null;
  }

  function recordBooking(booking) {
    const rate = getCreditsRate(tier);
    const creditsEarned = Math.round(booking.priceUSD * rate);
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

  // NightDrop Exchange — peer-to-peer booking transfer marketplace
  const [transfers, setTransfers] = useState(seedTransfers);
  const EXCHANGE_FEE = 0.10; // 10% NightDrop cut on resales

  function listForTransfer(bookingId, listPrice, sellerNote) {
    const booking = bookings.find((b) => b.id === bookingId);
    const hotel = pricedHotels.find((h) => h.id === booking?.hotelId);
    if (!booking || !hotel) return;

    const transferId = `tx_${Math.random().toString(36).slice(2, 9)}`;
    setTransfers((prev) => [
      {
        id: transferId,
        bookingId,
        hotelId: hotel.id,
        hotelName: hotel.name,
        neighborhood: hotel.neighborhood,
        hotelImage: hotel.image,
        roomType: booking.roomType || 'Standard Room',
        checkInTime: booking.checkInTime || 'Standard check-in (3 PM)',
        originalPrice: booking.priceUSD,
        listPrice,
        sellerName: booking.guestName,
        sellerNote: sellerNote || '',
        listedAt: new Date().toISOString(),
        status: 'available',
        checkInDate: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    // Mark the source booking as listed
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, listedOnExchange: transferId } : b))
    );
  }

  function cancelTransferListing(transferId) {
    const tx = transfers.find((t) => t.id === transferId);
    setTransfers((prev) => prev.filter((t) => t.id !== transferId));
    if (tx?.bookingId) {
      setBookings((prev) =>
        prev.map((b) => (b.id === tx.bookingId ? { ...b, listedOnExchange: null } : b))
      );
    }
  }

  function buyTransfer(transferId, buyerName, buyerEmail) {
    const tx = transfers.find((t) => t.id === transferId);
    if (!tx || tx.status !== 'available') return null;

    // Mark transfer sold
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'sold', soldAt: new Date().toISOString() } : t))
    );

    // Mark original booking as transferred
    if (tx.bookingId) {
      setBookings((prev) =>
        prev.map((b) => (b.id === tx.bookingId ? { ...b, transferred: true, listedOnExchange: null } : b))
      );
    }

    // Create a new booking for the buyer
    const newBookingId = `bk_${Math.random().toString(36).slice(2, 9)}`;
    const creditsEarned = Math.round(tx.listPrice * 0.05);
    setBookings((prev) => [
      {
        id: newBookingId,
        hotelId: tx.hotelId,
        hotelName: tx.hotelName,
        roomType: tx.roomType,
        checkInTime: tx.checkInTime,
        guestName: buyerName,
        guestEmail: buyerEmail,
        priceUSD: tx.listPrice,
        creditsEarned,
        reviewed: false,
        transferredFrom: transferId,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    earnCredits(creditsEarned);
    pushToast({
      title: `Booking transferred! You're in at ${tx.hotelName}`,
      body: `Confirmation sent to ${buyerEmail}. ⭐ +${creditsEarned} credits earned.`,
    });
    return newBookingId;
  }

  // Night Out bundle bookings — hotel + dinner + experience combos
  const [bundleBookings, setBundleBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nd_bundle_bookings') || '[]'); }
    catch { return []; }
  });

  function bookBundle(bundle, hotelPrice, guestName, guestEmail, guests, dinnerTime, totalUSD) {
    const id = `nb_${Math.random().toString(36).slice(2, 9)}`;
    const creditsEarned = Math.round(totalUSD * 0.05);
    const booking = {
      id,
      bundleId: bundle.id,
      bundleName: bundle.name,
      city: bundle.city,
      hotelId: bundle.hotelId,
      hotelPrice,
      dinnerRestaurant: bundle.dinner.restaurant,
      dinnerCuisine: bundle.dinner.cuisine,
      dinnerTime,
      experienceName: bundle.experience.name,
      experienceType: bundle.experience.type,
      experienceTime: bundle.experience.time,
      guestName,
      guestEmail,
      guests,
      totalUSD,
      creditsEarned,
      createdAt: new Date().toISOString(),
    };
    setBundleBookings((prev) => {
      const next = [booking, ...prev];
      localStorage.setItem('nd_bundle_bookings', JSON.stringify(next));
      return next;
    });
    earnCredits(creditsEarned);
    pushToast({
      title: `Night booked: ${bundle.name}`,
      body: `Dinner at ${bundle.dinner.restaurant} + ${bundle.experience.name}. ⭐ +${creditsEarned} credits.`,
    });
    return id;
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
    transfers,
    EXCHANGE_FEE,
    listForTransfer,
    cancelTransferListing,
    buyTransfer,
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
    // Auth
    user, showAuth, setShowAuth, signUp, signOut,
    // Groups
    groups, createGroup, joinGroup,
    // Flash drops
    flashDrops,
    // Price locks
    priceLocks, lockPrice, getActiveLock,
    // Loyalty
    tier, totalSpend,
    // Walk-in mode
    walkInMode,
    bundleBookings,
    bookBundle,
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
