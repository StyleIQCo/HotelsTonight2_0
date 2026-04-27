import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';

export default function SearchBar() {
  const { hotels } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();

  const results = query.length >= 2
    ? hotels.filter((h) => {
        const q = query.toLowerCase();
        return h.name.toLowerCase().includes(q)
          || h.neighborhood.toLowerCase().includes(q)
          || (h.city || '').toLowerCase().includes(q);
      }).slice(0, 6)
    : [];

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, []);

  function pick(hotel) {
    nav(`/hotel/${hotel.id}`);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={ref} className="search-wrap">
      <div className="search-field">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Hotel or city…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <button className="search-clear" onClick={() => { setQuery(''); setOpen(false); }}>✕</button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((h) => (
            <button key={h.id} className="search-result" onClick={() => pick(h)}>
              <div
                className="search-result-img"
                style={{ backgroundImage: `url(${h.image})` }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{h.neighborhood} · {'★'.repeat(h.stars)}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--good)', flexShrink: 0 }}>
                ${h.pricing?.final ?? '—'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
