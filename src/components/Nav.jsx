import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Nav() {
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
          <NavLink to="/partners" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
