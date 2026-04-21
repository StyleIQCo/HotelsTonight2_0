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

export default function FilterBar({ sortBy, setSortBy, minStars, setMinStars, favsOnly, setFavsOnly, resultCount }) {
  const { userLocation, favorites } = useApp();

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

      {favorites.size > 0 && (
        <button
          className={`filter-chip filter-chip-fav${favsOnly ? ' active' : ''}`}
          onClick={() => setFavsOnly((v) => !v)}
        >
          ❤️ Saved ({favorites.size})
        </button>
      )}

      <span className="filter-result-count">{resultCount} hotels</span>
    </div>
  );
}
