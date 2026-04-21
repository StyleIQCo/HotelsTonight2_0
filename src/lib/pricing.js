// Dynamic discount engine.
//
// Two levers partner hotels can pull (or we can pull on their behalf):
//   1. Late-check-in discount: the later it gets past "prime time" (default 6pm),
//      the deeper the discount — up to a cap at a cutoff hour.
//   2. Vacancy discount: the more rooms left unsold tonight, the deeper
//      the discount — linear from a floor vacancy rate up to a cap.
// Both discounts stack, but the total is clamped so partners never give
// away rooms below their walk-in floor.

export const PRICING_DEFAULTS = {
  primeTimeHour: 18,      // 6pm: discounts start accruing
  cutoffHour: 23,         // by 11pm we're at the max late-check-in discount
  maxLatePct: 0.35,       // 35% max late-check-in discount
  minVacancyRate: 0.30,   // vacancy discount kicks in above 30% empty
  maxVacancyPct: 0.30,    // 30% max vacancy discount
  floorPct: 0.45          // never discount more than 45% off rack
};

/**
 * Compute the late-check-in discount percentage (0..maxLatePct) for a given hour.
 */
export function lateCheckInDiscount(hour, cfg = PRICING_DEFAULTS) {
  if (hour < cfg.primeTimeHour) return 0;
  if (hour >= cfg.cutoffHour) return cfg.maxLatePct;
  const span = cfg.cutoffHour - cfg.primeTimeHour;
  const progressed = hour - cfg.primeTimeHour;
  return (progressed / span) * cfg.maxLatePct;
}

/**
 * Compute the vacancy discount percentage (0..maxVacancyPct).
 */
export function vacancyDiscount(vacancyRate, cfg = PRICING_DEFAULTS) {
  if (vacancyRate <= cfg.minVacancyRate) return 0;
  const span = 1 - cfg.minVacancyRate;
  const over = vacancyRate - cfg.minVacancyRate;
  return (over / span) * cfg.maxVacancyPct;
}

/**
 * Returns the per-night pricing for a hotel.
 * forTomorrow=true removes the late-check-in urgency discount (no same-night rush),
 * and dampens vacancy discount by 30% since tomorrow still has time to fill.
 *
 * { rack, final, totalPct, lateShare, vacancyShare, reasons[] }
 */
export function priceHotel(hotel, now = new Date(), cfg = PRICING_DEFAULTS, forTomorrow = false) {
  const late = forTomorrow ? 0 : lateCheckInDiscount(now.getHours(), cfg);
  const rawVac = vacancyDiscount(hotel.vacancyRate, cfg);
  const vac = forTomorrow ? rawVac * 0.70 : rawVac;
  let total = late + vac;
  if (total > cfg.floorPct) total = cfg.floorPct;

  const final = Math.round(hotel.rackRate * (1 - total));
  const reasons = [];
  if (late > 0.01) {
    reasons.push({
      kind: 'late',
      label: `Late check-in (after ${cfg.primeTimeHour}:00)`,
      pct: late
    });
  }
  if (vac > 0.01) {
    reasons.push({
      kind: 'vacancy',
      label: `High vacancy (${Math.round(hotel.vacancyRate * 100)}% open)`,
      pct: vac
    });
  }

  return {
    rack: hotel.rackRate,
    final,
    totalPct: total,
    lateShare: late,
    vacancyShare: vac,
    reasons
  };
}

const PERK_MAP = [
  { keywords: ['pool', 'pools'], emoji: '🏊', label: 'Pool' },
  { keywords: ['spa', 'hammam', 'wellness'], emoji: '💆', label: 'Spa' },
  { keywords: ['wi-fi', 'wifi', 'internet'], emoji: '📶', label: 'Free Wi-Fi' },
  { keywords: ['ev charging'], emoji: '⚡', label: 'EV Charging' },
  { keywords: ['michelin', 'tasting', 'farm-to-table', "chef's counter", 'chefs counter', 'restaurant', 'dining'], emoji: '🍽️', label: 'Fine Dining' },
  { keywords: ['golf'], emoji: '⛳', label: 'Golf' },
  { keywords: ['rooftop', 'observatory'], emoji: '🌆', label: 'Rooftop' },
  { keywords: ['gym', 'fitness', 'peloton', 'yoga', 'lap pool'], emoji: '🏋️', label: 'Fitness' },
  { keywords: ['rolls-royce', 'tesla house car', 'house car'], emoji: '🚗', label: 'House Car' },
  { keywords: ['pet'], emoji: '🐾', label: 'Pet Friendly' },
];

export function getPerkBadges(amenities, max = 3) {
  const lower = amenities.map((a) => a.toLowerCase());
  const badges = [];
  for (const perk of PERK_MAP) {
    if (badges.length >= max) break;
    if (perk.keywords.some((kw) => lower.some((a) => a.includes(kw)))) {
      badges.push({ emoji: perk.emoji, label: perk.label });
    }
  }
  return badges;
}

/**
 * Generate tiered room types for a hotel.
 * All prices are expressed as multipliers on top of the base nightly rate.
 */
export function makeRoomTypes(hotel) {
  const is5 = hotel.stars >= 5;
  return [
    {
      id: 'standard',
      name: 'Standard Room',
      multiplier: 1.0,
      beds: '1 King Bed',
      maxGuests: 2,
      sqft: is5 ? 480 : 380,
      description: 'Premium linens, in-room espresso, and full access to all hotel facilities.',
    },
    {
      id: 'deluxe',
      name: is5 ? 'Deluxe Room' : 'Superior Room',
      multiplier: 1.30,
      beds: '1 King or 2 Queens',
      maxGuests: 3,
      sqft: is5 ? 640 : 520,
      description: 'Upgraded city or garden views, enhanced minibar, and priority check-in.',
    },
    {
      id: 'suite',
      name: is5 ? 'Junior Suite' : 'Suite',
      multiplier: 1.75,
      beds: '1 King + Separate Living Area',
      maxGuests: 4,
      sqft: is5 ? 1100 : 820,
      description: 'Separate living room, soaking tub, premium bar, and dedicated concierge.',
    },
  ];
}

/** Haversine-ish distance in miles between two lat/lng points. */
export function distanceMiles(a, b) {
  if (!a || !b) return null;
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
