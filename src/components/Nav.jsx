import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../store.jsx';

export default function Nav() {
  const { credits } = useApp();
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-logo">ND</span>
          NightDrop
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Tonight
          </NavLink>
          <NavLink to="/for-hotels" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            For Hotels
          </NavLink>
          <NavLink to="/prospects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Prospects
          </NavLink>
          <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            My Trips
          </NavLink>
          <NavLink to="/partners" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          {credits > 0 && (
            <Link to="/my-bookings" className="nav-credits">
              ⭐ {credits.toLocaleString()}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
