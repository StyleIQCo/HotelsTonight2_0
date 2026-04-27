// Time-of-day intelligence for Night Out bundles.
// All logic is driven by simulatedHour (0-23) from the app store.

export const CATEGORIES = {
  workout:   { label: 'Workout',    emoji: '💪', desc: 'Sweat class + fuel + rest' },
  brunch:    { label: 'Brunch',     emoji: '☕', desc: 'Sleep in + brunch + explore' },
  happyHour: { label: 'Happy Hour', emoji: '🍸', desc: 'Cocktails + small plates' },
  dinner:    { label: 'Night Out',  emoji: '🎭', desc: 'Dinner + show — the full evening' },
  windDown:  { label: 'Wind Down',  emoji: '🛁', desc: 'Spa + light meal + early night' },
  lateNight: { label: 'Late Night', emoji: '🌃', desc: 'After-dark eats + nightcap' },
};

// Returns the broad period name for a given hour (0-23).
export function getTimeOfDay(hour) {
  if (hour >= 4 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'lateNight'; // 22-4
}

// Contextual messaging + which bundle categories to surface for a given hour.
export function getTimeContext(hour) {
  const tod = getTimeOfDay(hour);
  return {
    morning: {
      headline: "Early bird energy",
      sub: "Knock out a workout, fuel up, and crash somewhere nice.",
      bestCategories: ['workout'],
      suggestion: "A 6 AM class, a protein-heavy brunch, and a room to nap in — that's a morning.",
    },
    midday: {
      headline: "Afternoon wide open",
      sub: "Great time to lock in tonight's plans before the good slots fill.",
      bestCategories: ['brunch', 'dinner', 'happyHour'],
      suggestion: "Book now and your dinner reservation and show tickets are locked — nothing to figure out later.",
    },
    afternoon: {
      headline: "Happy hour is close",
      sub: "Cocktails and small plates in a couple hours. Wind-down spa if you need to decompress first.",
      bestCategories: ['happyHour', 'windDown'],
      suggestion: "The 5 PM rush is real. Rooftop bar, craft cocktails, charcuterie — or go spa first if it's been a week.",
    },
    evening: {
      headline: "Tonight is on",
      sub: "Prime window for a full night out. Dinner slots at 7-8 PM are filling.",
      bestCategories: ['dinner', 'happyHour'],
      suggestion: "Dinner + show is the move right now. Bonus: you're already checked in.",
    },
    lateNight: {
      headline: "Still going — or winding down?",
      sub: "Late-night eats and a nightcap, or a spa morning and a slow checkout.",
      bestCategories: ['lateNight', 'windDown'],
      suggestion: "It's late. Either keep it going with a nightcap and ramen, or book the wind-down bundle and wake up right.",
    },
  }[tod];
}

// Returns 'now' | 'upcoming' | 'past' for a bundle at the given hour.
export function bundleTimeStatus(bundle, hour) {
  const [start, end] = bundle.bestTimeRange;
  const inRange = end > start
    ? hour >= start && hour < end
    : hour >= start || hour < end; // wraps midnight (e.g. [22, 4])
  if (inRange) return 'now';
  // Is it still coming up today?
  if (end > start && hour < start) return 'upcoming';
  if (end <= start && hour < end) return 'now'; // already checked above
  return 'past';
}

export function bundleStartsIn(bundle, hour) {
  const [start] = bundle.bestTimeRange;
  if (hour < start) {
    const diff = start - hour;
    return diff === 1 ? 'in ~1 hour' : `in ~${diff} hours`;
  }
  return null;
}

export function formatHour(h) {
  const norm = ((h % 24) + 24) % 24;
  if (norm === 0) return 'midnight';
  if (norm === 12) return '12 PM';
  return norm < 12 ? `${norm} AM` : `${norm - 12} PM`;
}

// Sort bundles: available-now first, then upcoming, then past.
export function sortBundlesByTime(bundles, hour) {
  const order = { now: 0, upcoming: 1, past: 2 };
  return [...bundles].sort((a, b) => {
    const sa = order[bundleTimeStatus(a, hour)];
    const sb = order[bundleTimeStatus(b, hour)];
    if (sa !== sb) return sa - sb;
    return a.bestTimeRange[0] - b.bestTimeRange[0];
  });
}

// Returns the bundles most relevant to the current time (for homepage strip).
export function featuredBundlesForTime(bundles, hour, count = 4) {
  const sorted = sortBundlesByTime(bundles, hour);
  // Prefer bundles that are available now or starting soon
  return sorted.slice(0, count);
}
