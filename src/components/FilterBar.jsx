import React from 'react';
import { useApp } from '../store.jsx';

const SORT_OPTIONS = [
  { value: 'deal',     label: '🔥 Best Deal' },
  { value: 'price',    label: '💰 Lowest Price' },
  { value: 'stars',    label: '⭐ Highest Stars' },
  { value: 'distance', label: '📍 Closest' },
];

const STAR_OPTIONS = [
  { value: 0, label: 'All' },
  { value: 4, label: '4★+' },
  { value: 5, label: '5★ Only' },
];

export const AMENITY_FILTERS = [
  { id: 'pool',      label: '🏊 Pool',         keywords: ['pool'] },
  { id: 'spa',       label: '💆 Spa',          keywords: ['spa', 'hammam', 'wellness'] },
  { id: 'dining',    label: '🍽️ Fine Dining',  keywords: ['michelin', 'restaurant', 'tasting', 'farm-to-table', 'chefs counter'] },
  { id: 'wifi',      label: '📶 Free Wi-Fi',   keywords: ['wi-fi', 'wifi'] },
  { id: 'pet',       label: '🐾 Pet Friendly', keywords: ['pet'] },
  { id: 'rooftop',   label: '🌆 Rooftop',      keywords: ['rooftop', 'observatory'] },
  { id: 'ev',        label: '⚡ EV Charging',  keywords: ['ev charging'] },
  { id: 'housecar',  label: '🚗 House Car',    keywords: ['house car', 'rolls-royce', 'tesla house car'] },
];

export function hotelMatchesAmenity(hotel, amenityId) {
  const filter = AMENITY_FILTERS.find((a) => a.id === amenityId);
  if (!filter) return true;
  const lower = hotel.amenities.map((a) => a.toLowerCase());
  return filter.keywords.some((kw) => lower.some((a) => a.includes(kw)));
}

export default function FilterBar({
  sortBy, setSortBy,
  minStars, setMinStars,
  favsOnly, setFavsOnly,
  amenities, setAmenities,
  resultCount,
}) {
  const { userLocation, favorites } = useApp();

  function toggleAmenity(id) {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">Sort</span>
        <div className="filter-chips">
          {SORT_OPTIONS.map((opt) => {
            if (opt.value === 'distance' && !userLocation) return null;
            return (
              <button
                key={opt.value}
                className={`filter-chip${sortBy === opt.value ? ' active' : ''}`}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Stars</span>
        <div className="filter-chips">
          {STAR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-chip${minStars === opt.value ? ' active' : ''}`}
              onClick={() => setMinStars(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Amenities</span>
        <div className="filter-chips">
          {AMENITY_FILTERS.map((opt) => (
            <button
              key={opt.id}
              className={`filter-chip${amenities.includes(opt.id) ? ' active' : ''}`}
              onClick={() => toggleAmenity(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {favorites.size > 0 && (
        <button
          className={`filter-chip filter-chip-fav${favsOnly ? ' active' : ''}`}
          onClick={() => setFavsOnly((v) => !v)}
        >
          ❤️ Saved ({favorites.size})
        </button>
      )}

      {(amenities.length > 0 || minStars > 0 || favsOnly) && (
        <button
          className="filter-chip"
          style={{ color: 'var(--accent)', borderColor: 'var(--accent-soft)' }}
          onClick={() => { setMinStars(0); setFavsOnly(false); setAmenities([]); }}
        >
          ✕ Clear all
        </button>
      )}

      <span className="filter-result-count">{resultCount} hotels</span>
    </div>
  );
}
