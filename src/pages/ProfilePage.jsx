import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { TIERS, TIER_PERKS, getNextTier } from '../lib/loyalty.js';

function ReferralPanel({ user }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/?ref=${user.referralCode}`;

  function copy() {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="detail-card" style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🎁 Your referral link</div>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>
        Share your link. They get +100 credits, you get +200 credits when they sign up.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="input" style={{ flex: 1, fontSize: 13, color: 'var(--muted)', userSelect: 'all', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {link}
        </div>
        <button className="btn-primary" style={{ padding: '10px 16px', fontSize: 13, flexShrink: 0 }} onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
        Your code: <strong style={{ color: 'var(--text)' }}>{user.referralCode}</strong>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, signOut, credits, tier, totalSpend, bookings, bundleBookings, groups } = useApp();
  if (!user) return (
    <div className="empty-state">
      <p>Sign in to view your profile.</p>
      <Link to="/" className="btn-primary">Back home</Link>
    </div>
  );

  const tierInfo = TIERS[tier];
  const next = getNextTier(totalSpend);
  const perks = TIER_PERKS[tier];
  const progressPct = next ? Math.min(100, Math.round(((totalSpend - (tierInfo.minSpend)) / (next.remaining + (totalSpend - tierInfo.minSpend))) * 100)) : 100;

  return (
    <div style={{ maxWidth: 680, margin: '32px auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div className="profile-avatar">{user.name[0].toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{user.name}</div>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>{user.email}</div>
          <div style={{ marginTop: 4 }}>
            <span style={{ color: tierInfo.color, fontWeight: 700, fontSize: 13 }}>
              {tierInfo.emoji} {tierInfo.label} member
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}> · {credits.toLocaleString()} credits</span>
          </div>
        </div>
        <button className="btn-ghost" style={{ fontSize: 13, padding: '8px 14px' }} onClick={signOut}>
          Sign out
        </button>
      </div>

      {/* Loyalty tier card */}
      <div className="detail-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{tierInfo.emoji} {tierInfo.label} Tier</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--good)' }}>
            ⭐ {credits.toLocaleString()}
          </div>
        </div>

        {next && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>
              <span>{tierInfo.label}</span>
              <span>${next.remaining} to {next.name}</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-elev)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: tierInfo.color, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {perks.map((p, i) => (
            <span key={i} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'var(--muted)' }}>
              ✓ {p}
            </span>
          ))}
        </div>
      </div>

      <ReferralPanel user={user} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Hotel stays', value: bookings.length },
          { label: 'Night Out', value: bundleBookings.length },
          { label: 'Total spent', value: `$${totalSpend}` },
        ].map((s) => (
          <div key={s.label} className="detail-card" style={{ textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ fontWeight: 800, fontSize: 22 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Groups */}
      {groups.length > 0 && (
        <div className="detail-card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>👥 Your group trips</div>
          {groups.map((g) => {
            const hotel = g.hotelId;
            return (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{g.members.length} {g.members.length === 1 ? 'person' : 'people'} · {g.hotelName || g.bundleName}</div>
                </div>
                <Link to={`/groups/${g.id}`} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>Manage</Link>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Link to="/my-bookings" className="btn-ghost" style={{ flex: 1, textAlign: 'center', padding: 12 }}>My Bookings</Link>
        <Link to="/" className="btn-ghost" style={{ flex: 1, textAlign: 'center', padding: 12 }}>Find tonight's deal</Link>
      </div>
    </div>
  );
}
