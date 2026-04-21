// Market intelligence engine — tracks seasonal patterns, weather quality,
// US holidays, and local conferences/events to surface demand signals and
// price-spike warnings on each hotel.

// Seasonal demand index per city by month (Jan=0 … Dec=11).
// >1.0 = above-average demand, <1.0 = below-average demand.
const SEASONAL = {
  'New York':       [0.70, 0.70, 0.85, 1.00, 1.10, 1.20, 1.20, 1.15, 1.10, 1.05, 0.95, 0.80],
  'Las Vegas':      [0.85, 0.85, 1.05, 1.10, 0.90, 0.70, 0.60, 0.65, 1.00, 1.10, 1.15, 1.20],
  'Los Angeles':    [0.85, 0.85, 0.95, 1.05, 1.10, 1.15, 1.20, 1.20, 1.05, 0.95, 0.90, 0.85],
  'San Francisco':  [0.80, 0.80, 0.90, 1.00, 1.10, 1.15, 1.00, 0.95, 1.10, 1.05, 0.90, 0.80],
  'Seattle':        [0.70, 0.70, 0.80, 0.90, 1.05, 1.15, 1.20, 1.20, 1.10, 0.90, 0.75, 0.70],
  'Bellevue':       [0.70, 0.70, 0.80, 0.90, 1.05, 1.15, 1.20, 1.20, 1.10, 0.90, 0.75, 0.70],
};

// Travel-weather quality by city and month (1.0 = ideal for visitors).
const WEATHER_Q = {
  'New York':       [0.50, 0.55, 0.70, 0.85, 0.95, 1.00, 0.85, 0.85, 0.95, 0.90, 0.70, 0.55],
  'Las Vegas':      [0.90, 0.90, 1.00, 1.00, 0.90, 0.70, 0.50, 0.50, 0.85, 1.00, 1.00, 0.90],
  'Los Angeles':    [0.90, 0.90, 0.95, 1.00, 1.00, 0.95, 0.85, 0.85, 1.00, 1.00, 0.95, 0.90],
  'San Francisco':  [0.70, 0.70, 0.75, 0.80, 0.85, 0.80, 0.75, 0.75, 0.90, 0.90, 0.80, 0.70],
  'Seattle':        [0.50, 0.50, 0.60, 0.75, 0.90, 1.00, 1.00, 1.00, 0.90, 0.70, 0.55, 0.50],
  'Bellevue':       [0.50, 0.50, 0.60, 0.75, 0.90, 1.00, 1.00, 1.00, 0.90, 0.70, 0.55, 0.50],
};

// US holidays & major travel events for 2025–2026.
const HOLIDAYS = [
  { date: '2025-11-27', name: 'Thanksgiving',          impact: 'high' },
  { date: '2025-12-24', name: 'Christmas Eve',          impact: 'high' },
  { date: '2025-12-25', name: 'Christmas Day',          impact: 'high' },
  { date: '2025-12-31', name: "New Year's Eve",         impact: 'very_high' },
  { date: '2026-01-01', name: "New Year's Day",         impact: 'high' },
  { date: '2026-01-19', name: 'MLK Day weekend',        impact: 'medium' },
  { date: '2026-02-14', name: "Valentine's Day",        impact: 'medium' },
  { date: '2026-02-16', name: "Presidents' Day",        impact: 'medium' },
  { date: '2026-03-15', name: 'Spring Break starts',    impact: 'high' },
  { date: '2026-03-22', name: 'Spring Break peak',      impact: 'high' },
  { date: '2026-04-05', name: 'Easter weekend',         impact: 'medium' },
  { date: '2026-05-25', name: 'Memorial Day weekend',   impact: 'high' },
  { date: '2026-07-04', name: 'Independence Day',       impact: 'high' },
  { date: '2026-09-07', name: 'Labor Day weekend',      impact: 'high' },
  { date: '2026-11-26', name: 'Thanksgiving',           impact: 'high' },
  { date: '2026-12-24', name: 'Christmas Eve',          impact: 'high' },
  { date: '2026-12-25', name: 'Christmas Day',          impact: 'high' },
  { date: '2026-12-31', name: "New Year's Eve",         impact: 'very_high' },
];

// Recurring local conferences and events by city (approximate 2026 dates).
export const EVENTS_BY_CITY = {
  'Las Vegas': [
    { name: 'CES',                         start: '2026-01-06', end: '2026-01-09', type: 'conference', impact: 'very_high' },
    { name: 'SEMA Auto Show',               start: '2026-11-03', end: '2026-11-06', type: 'conference', impact: 'very_high' },
    { name: 'AWS re:Invent',                start: '2026-11-30', end: '2026-12-04', type: 'conference', impact: 'very_high' },
    { name: 'Formula 1 Las Vegas GP',       start: '2026-11-19', end: '2026-11-21', type: 'event',      impact: 'very_high' },
    { name: 'NFR Rodeo Finals',             start: '2026-12-03', end: '2026-12-12', type: 'event',      impact: 'high' },
  ],
  'San Francisco': [
    { name: 'GDC (Game Developers Conf.)',  start: '2026-03-16', end: '2026-03-20', type: 'conference', impact: 'high' },
    { name: 'Google I/O',                   start: '2026-05-12', end: '2026-05-14', type: 'conference', impact: 'high' },
    { name: 'Bay to Breakers',              start: '2026-05-17', end: '2026-05-17', type: 'event',      impact: 'medium' },
    { name: 'Outside Lands Music Festival', start: '2026-08-07', end: '2026-08-09', type: 'event',      impact: 'high' },
    { name: 'Dreamforce',                   start: '2026-09-15', end: '2026-09-18', type: 'conference', impact: 'very_high' },
  ],
  'New York': [
    { name: 'NRF Retail Big Show',          start: '2026-01-11', end: '2026-01-14', type: 'conference', impact: 'high' },
    { name: 'NY Fashion Week',              start: '2026-02-12', end: '2026-02-18', type: 'event',      impact: 'very_high' },
    { name: 'Tribeca Film Festival',        start: '2026-06-08', end: '2026-06-20', type: 'event',      impact: 'high' },
    { name: 'US Open Tennis',               start: '2026-08-24', end: '2026-09-13', type: 'event',      impact: 'high' },
    { name: 'NY Comic Con',                 start: '2026-10-08', end: '2026-10-11', type: 'event',      impact: 'high' },
    { name: 'NYC Marathon',                 start: '2026-11-01', end: '2026-11-01', type: 'event',      impact: 'high' },
  ],
  'Los Angeles': [
    { name: 'Rose Bowl',                    start: '2026-01-01', end: '2026-01-01', type: 'event',      impact: 'high' },
    { name: 'Coachella Weekend 1',          start: '2026-04-10', end: '2026-04-12', type: 'event',      impact: 'very_high' },
    { name: 'Coachella Weekend 2',          start: '2026-04-17', end: '2026-04-19', type: 'event',      impact: 'very_high' },
    { name: 'E3 / Summer Game Fest',        start: '2026-06-08', end: '2026-06-12', type: 'conference', impact: 'high' },
    { name: 'Lollapalooza LA',              start: '2026-07-23', end: '2026-07-26', type: 'event',      impact: 'high' },
    { name: 'LA Film Festival',             start: '2026-09-17', end: '2026-09-26', type: 'event',      impact: 'medium' },
  ],
  'Seattle': [
    { name: 'AWS Summit Seattle',           start: '2026-06-08', end: '2026-06-10', type: 'conference', impact: 'high' },
    { name: 'Seattle Seafair',              start: '2026-08-01', end: '2026-08-02', type: 'event',      impact: 'high' },
    { name: 'Bumbershoot Music Festival',   start: '2026-08-29', end: '2026-08-31', type: 'event',      impact: 'high' },
  ],
  'Bellevue': [
    { name: 'Microsoft Build',              start: '2026-05-19', end: '2026-05-22', type: 'conference', impact: 'very_high' },
    { name: 'Bellevue Arts Museum Fair',    start: '2026-07-24', end: '2026-07-26', type: 'event',      impact: 'medium' },
  ],
};

const IMPACT_VAL = { very_high: 0.35, high: 0.20, medium: 0.10, low: 0.05 };

function parseDay(str) {
  const d = new Date(str + 'T00:00:00');
  d.setHours(0, 0, 0, 0);
  return d;
}

function isWithin(date, startStr, endStr, daysBefore = 2) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const start = parseDay(startStr);
  const preStart = new Date(start); preStart.setDate(preStart.getDate() - daysBefore);
  const end = parseDay(endStr); end.setHours(23, 59, 59, 999);
  return d >= preStart && d <= end;
}

function extractCity(hotel) {
  const parts = hotel.neighborhood.split(',');
  return parts[parts.length - 1].trim();
}

export function getActiveEvents(city, date = new Date()) {
  return (EVENTS_BY_CITY[city] || []).filter((e) => isWithin(date, e.start, e.end));
}

export function getActiveHolidays(date = new Date(), windowDays = 3) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  return HOLIDAYS.filter((h) => {
    const hd = parseDay(h.date);
    const diff = (hd - d) / 86400000;
    return diff >= -1 && diff <= windowDays;
  });
}

export function getDemandLabel(multiplier) {
  if (multiplier >= 1.35) return { label: 'Very High Demand', color: '#ff4d6d', bar: 4 };
  if (multiplier >= 1.15) return { label: 'High Demand',      color: '#ffb84d', bar: 3 };
  if (multiplier >= 0.90) return { label: 'Normal Demand',    color: '#37d6a0', bar: 2 };
  return                         { label: 'Low Demand',       color: '#9aa4c7', bar: 1 };
}

/**
 * Main function — returns a full market intelligence snapshot for one hotel on one date.
 *
 * Return shape:
 * {
 *   city, multiplier,
 *   factors: [{ type, emoji, label, impact, positive, isActive? }],
 *   demand: { label, color, bar },
 *   priceDirection: 'up' | 'down' | 'stable',
 *   seasonal, weatherQ, activeEvents, activeHolidays
 * }
 */
export function getMarketIntelligence(hotel, date = new Date()) {
  const city = extractCity(hotel);
  const month = date.getMonth();
  const dow = date.getDay();

  const seasonal = (SEASONAL[city] || SEASONAL['New York'])[month];
  const weatherQ = (WEATHER_Q[city] || WEATHER_Q['New York'])[month];
  const activeEvents = getActiveEvents(city, date);
  const activeHolidays = getActiveHolidays(date);

  const factors = [];

  if (seasonal >= 1.1)
    factors.push({ type: 'season', emoji: '📅', label: `Peak season in ${city}`, impact: seasonal - 1, positive: false });
  else if (seasonal <= 0.85)
    factors.push({ type: 'season', emoji: '📅', label: `Off-season in ${city}`, impact: 1 - seasonal, positive: true });

  if (weatherQ >= 0.95)
    factors.push({ type: 'weather', emoji: '☀️', label: 'Ideal travel weather', impact: 0.08, positive: false });
  else if (weatherQ <= 0.60)
    factors.push({ type: 'weather', emoji: '🌧️', label: 'Inclement weather expected', impact: 0.08, positive: true });

  for (const ev of activeEvents) {
    const impactVal = IMPACT_VAL[ev.impact] || 0.10;
    factors.push({
      type: 'event',
      emoji: ev.type === 'conference' ? '🏢' : '🎪',
      label: ev.name,
      impact: impactVal,
      positive: false,
      isActive: isWithin(date, ev.start, ev.end, 0),
    });
  }

  for (const h of activeHolidays) {
    factors.push({ type: 'holiday', emoji: '🎉', label: h.name, impact: IMPACT_VAL[h.impact] || 0.10, positive: false });
  }

  if (dow === 5) factors.push({ type: 'weekend', emoji: '📆', label: 'Friday night surge',   impact: 0.10, positive: false });
  if (dow === 6) factors.push({ type: 'weekend', emoji: '📆', label: 'Saturday night surge', impact: 0.15, positive: false });

  // Aggregate multiplier
  let multiplier = seasonal * (0.85 + weatherQ * 0.15);
  for (const f of factors) {
    if (f.type !== 'season' && f.type !== 'weather') {
      multiplier += f.positive ? -f.impact : f.impact;
    }
  }
  multiplier = Math.max(0.5, Math.min(2.0, multiplier));

  // Compare to 4 days from now to generate a direction signal
  const futureDate = new Date(date); futureDate.setDate(futureDate.getDate() + 4);
  const futureSeasonal = (SEASONAL[city] || SEASONAL['New York'])[futureDate.getMonth()];
  const futureEvents = getActiveEvents(city, futureDate);
  const futureMultiplier = futureSeasonal + futureEvents.length * 0.15;
  const priceDirection = futureMultiplier > multiplier * 1.05 ? 'up'
    : futureMultiplier < multiplier * 0.95 ? 'down'
    : 'stable';

  return {
    city,
    multiplier,
    factors,
    demand: getDemandLabel(multiplier),
    priceDirection,
    seasonal,
    weatherQ,
    activeEvents,
    activeHolidays,
  };
}

// 7-day demand forecast (used by the sparkline / forecast chart)
export function getWeeklyForecast(hotel, startDate = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate); d.setDate(d.getDate() + i);
    const intel = getMarketIntelligence(hotel, d);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
      date: d,
      multiplier: intel.multiplier,
      demand: intel.demand,
      topFactor: intel.factors[0] || null,
    };
  });
}
