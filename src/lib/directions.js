// Build deep links to popular driving / navigation apps. All three formats
// are official, require no API key, and fall back gracefully — if the user
// doesn't have the native app installed, Waze/Google open in the browser,
// and Apple Maps opens maps.apple.com.
//
// Waze URL reference:
//   https://developers.google.com/waze/deeplinks
// Google Maps URL reference:
//   https://developers.google.com/maps/documentation/urls/get-started
// Apple Maps URL reference:
//   https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html

export function wazeUrl({ lat, lng }, { label } = {}) {
  // `navigate=yes` kicks straight into turn-by-turn. `q` adds a human label
  // so the destination shows with a name instead of raw coordinates.
  const q = label ? `&q=${encodeURIComponent(label)}` : '';
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes${q}`;
}

export function googleMapsUrl({ lat, lng }, { label } = {}) {
  // Force the driving travelmode, but leave origin empty so the user's current
  // location is used automatically by Google.
  const name = label ? `&destination_name=${encodeURIComponent(label)}` : '';
  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${lat},${lng}${name}`;
}

export function appleMapsUrl({ lat, lng }, { label } = {}) {
  const q = label ? `&q=${encodeURIComponent(label)}` : '';
  // `dirflg=d` = driving directions.
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d${q}`;
}

/**
 * Returns the best default navigation URL for the current device.
 * iOS/macOS Safari -> Apple Maps (opens the app).
 * Android -> Waze (if installed, else web).
 * Everything else -> Waze Web (which works in any browser).
 */
export function defaultDirectionsUrl(destination, opts) {
  if (typeof navigator === 'undefined') return wazeUrl(destination, opts);
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod|Macintosh/.test(ua)) return appleMapsUrl(destination, opts);
  return wazeUrl(destination, opts);
}
