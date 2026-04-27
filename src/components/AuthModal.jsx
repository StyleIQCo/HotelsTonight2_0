import React, { useEffect, useState } from 'react';
import { useApp } from '../store.jsx';

export default function AuthModal() {
  const { showAuth, setShowAuth, signUp } = useApp();
  const [tab, setTab] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ref, setRef] = useState('');

  // Read ?ref= from URL on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('ref')) setRef(p.get('ref'));
  }, []);

  if (!showAuth) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email) return;
    signUp(name, email, ref || null);
  }

  return (
    <div className="auth-backdrop" onClick={() => setShowAuth(false)}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={() => setShowAuth(false)}>✕</button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌙</div>
          <h2 style={{ margin: 0 }}>Join NightDrop</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '6px 0 0' }}>
            +100 welcome credits · save more the more you book
          </p>
        </div>

        {ref && (
          <div style={{ background: 'rgba(55,214,160,0.08)', border: '1px solid rgba(55,214,160,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--good)', marginBottom: 16 }}>
            🎁 You were referred! Sign up for +200 bonus credits.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="auth-name">Full name</label>
            <input id="auth-name" className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {!ref && (
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="auth-ref">Referral code <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
              <input id="auth-ref" className="input" placeholder="e.g. HENRY-4821" value={ref} onChange={(e) => setRef(e.target.value)} style={{ fontSize: 13 }} />
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ padding: 13, marginTop: 4 }}>
            Create account — it's free
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 16, marginBottom: 0 }}>
          No spam. No subscriptions. Just better hotel prices.
        </p>
      </div>
    </div>
  );
}
