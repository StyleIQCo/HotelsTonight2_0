import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store.jsx';

export default function JoinGroupPage() {
  const { id } = useParams();
  const { groups, hotels, joinGroup, user } = useApp();
  const nav = useNavigate();

  const group = groups.find((g) => g.id === id);
  const hotel = group?.hotelId ? hotels.find((h) => h.id === group.hotelId) : null;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [done, setDone] = useState(false);

  if (!group) return (
    <div className="empty-state">
      <p>This group link is no longer active.</p>
      <Link to="/" className="btn-ghost">Browse deals</Link>
    </div>
  );

  if (done) return (
    <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
      <div className="detail-card" style={{ padding: 36 }}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <h2 style={{ margin: '14px 0 6px' }}>You're in!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
          {group.organizerName} will see you on the list. {hotel ? "Book your room below." : ""}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {hotel && <Link to={`/checkout/${hotel.id}`} className="btn-primary">Book your room →</Link>}
          <Link to={`/groups/${group.id}`} className="btn-ghost">View group</Link>
        </div>
      </div>
    </div>
  );

  const alreadyJoined = group.members.some((m) => m.email === email);

  function handleJoin(e) {
    e.preventDefault();
    joinGroup(id, name, email);
    setDone(true);
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 36 }}>👥</div>
        <h2 style={{ margin: '10px 0 4px' }}>{group.name || `${group.organizerName.split(' ')[0]}'s group`}</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
          {group.organizerName} is planning a group stay — {group.members.length} {group.members.length === 1 ? 'person' : 'people'} so far.
        </p>
      </div>

      {hotel && (
        <div className="detail-card" style={{ marginBottom: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 10, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${hotel.image})`, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700 }}>{hotel.name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{hotel.neighborhood} · {'★'.repeat(hotel.stars)}</div>
            <div style={{ fontSize: 13, color: 'var(--good)', fontWeight: 700 }}>${hotel.pricing?.final}/night tonight</div>
          </div>
        </div>
      )}

      <form className="detail-card" onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Confirm your spot</div>
        <div className="field" style={{ margin: 0 }}>
          <label>Your name</label>
          <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Your email</label>
          <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: 13 }}>
          {alreadyJoined ? "You're already in — update" : "Join this group →"}
        </button>
      </form>
    </div>
  );
}
