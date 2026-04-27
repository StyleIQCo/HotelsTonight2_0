import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../store.jsx';
import SearchBar from './SearchBar.jsx';
import { TIERS } from '../lib/loyalty.js';

export default function Nav() {
  const { credits, user, setShowAuth, tier } = useApp();
  const tierColor = TIERS[tier]?.color;

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-logo">ND</span>
          <span className="brand-name">NightDrop</span>
        </Link>

        <div className="nav-search">
          <SearchBar />
        </div>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Tonight</NavLink>
          <NavLink to="/night-out" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>🎭 Night Out</NavLink>
          <NavLink to="/exchange" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>🔄 Exchange</NavLink>
          <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Trips</NavLink>

          {credits > 0 && (
            <Link to="/my-bookings" className="nav-credits">
              ⭐ {credits.toLocaleString()}
            </Link>
          )}

          {user ? (
            <Link to="/profile" className="nav-avatar" style={{ borderColor: tierColor }}>
              {user.name[0].toUpperCase()}
            </Link>
          ) : (
            <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => setShowAuth(true)}>
              Sign in
            </button>
          )}
        </nav>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        <NavLink to="/" end className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <span>🌙</span><span>Tonight</span>
        </NavLink>
        <NavLink to="/night-out" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <span>🎭</span><span>Night Out</span>
        </NavLink>
        <NavLink to="/exchange" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <span>🔄</span><span>Exchange</span>
        </NavLink>
        <NavLink to="/my-bookings" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <span>🧳</span><span>Trips</span>
        </NavLink>
        <NavLink to={user ? '/profile' : '#'} onClick={!user ? () => setShowAuth(true) : undefined} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <span>{user ? user.name[0].toUpperCase() : '👤'}</span><span>{user ? 'Profile' : 'Sign in'}</span>
        </NavLink>
      </nav>
    </header>
  );
}
