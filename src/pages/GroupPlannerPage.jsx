import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store.jsx';

function CopyLinkRow({ groupId }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/groups/${groupId}`;
  function copy() {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <div className="input" style={{ flex: 1, fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {link}
      </div>
      <button className="btn-primary" style={{ padding: '10px 16px', fontSize: 13, flexShrink: 0 }} onClick={copy}>
        {copied ? '✓ Copied' : '📋 Copy link'}
      </button>
    </div>
  );
}

export default function GroupPlannerPage() {
  const { id } = useParams();
  const { groups, hotels, user, setShowAuth, createGroup } = useApp();
  const nav = useNavigate();

  // If viewing existing group
  if (id) {
    const group = groups.find((g) => g.id === id);
    if (!group) return (
      <div className="empty-state">
        <p>Group not found.</p>
        <Link to="/" className="btn-ghost">Back home</Link>
      </div>
    );

    const hotel = hotels.find((h) => h.id === group.hotelId);

    return (
      <div style={{ maxWidth: 620, margin: '32px auto' }}>
        <div style={{ marginBottom: 12 }}>
          <Link to="/profile" style={{ color: 'var(--muted)', fontSize: 13 }}>← Your profile</Link>
        </div>
        <h2 style={{ margin: '0 0 4px' }}>{group.name}</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 20px' }}>
          Organized by {group.organizerName}
        </p>

        {hotel && (
          <div className="detail-card" style={{ marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 10, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${hotel.image})`, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700 }}>{hotel.name}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{hotel.neighborhood}</div>
              <div style={{ fontSize: 13, color: 'var(--good)', fontWeight: 700 }}>${hotel.pricing?.final}/night</div>
            </div>
            <Link to={`/checkout/${hotel.id}`} className="btn-primary" style={{ marginLeft: 'auto', fontSize: 13, padding: '9px 16px' }}>
              Book →
            </Link>
          </div>
        )}

        <div className="detail-card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            👥 {group.members.length} {group.members.length === 1 ? 'person' : 'people'} in this group
          </div>
          {group.members.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < group.members.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="profile-avatar" style={{ width: 32, height: 32, fontSize: 14 }}>{m.name[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.email}</div>
              </div>
              <span style={{ marginLeft: 'auto', background: 'rgba(55,214,160,0.12)', color: 'var(--good)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                {m.status}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Invite more people — share this link:</div>
            <CopyLinkRow groupId={group.id} />
          </div>
        </div>
      </div>
    );
  }

  // Create group form
  const [name, setName] = useState('');
  const [organizerName, setOrganizerName] = useState(user?.name || '');
  const [organizerEmail, setOrganizerEmail] = useState(user?.email || '');
  const [selectedHotel, setSelectedHotel] = useState('');
  const [done, setDone] = useState(null);

  function handleCreate(e) {
    e.preventDefault();
    if (!organizerName || !organizerEmail) {
      if (!user) { setShowAuth(true); return; }
      return;
    }
    const hotel = hotels.find((h) => h.id === selectedHotel);
    const id = createGroup({
      name: name || `${organizerName.split(' ')[0]}'s group`,
      organizerName,
      organizerEmail,
      hotelId: selectedHotel || null,
      hotelName: hotel?.name || null,
    });
    setDone(id);
  }

  if (done) {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}>
        <div className="detail-card" style={{ padding: 36 }}>
          <div style={{ fontSize: 48 }}>👥</div>
          <h2 style={{ margin: '14px 0 6px' }}>Group created!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Share this link and everyone can see the plan and book their spot.</p>
          <CopyLinkRow groupId={done} />
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to={`/groups/${done}`} className="btn-primary">View group</Link>
            <Link to="/" className="btn-ghost">Back to deals</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '32px auto' }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/" style={{ color: 'var(--muted)', fontSize: 13 }}>← Back</Link>
      </div>
      <h2 style={{ margin: '0 0 4px' }}>👥 Plan a group trip</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px' }}>
        Create a shared plan and invite your group via link. Everyone books their own room.
      </p>

      <form className="detail-card" onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field" style={{ margin: 0 }}>
          <label>Group name <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
          <input className="input" placeholder="e.g. Bachelor party · Work offsite" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Your name</label>
          <input className="input" placeholder="Organizer name" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} required />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Your email</label>
          <input className="input" type="email" placeholder="you@example.com" value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} required />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Hotel <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional — you can add later)</span></label>
          <select className="input" value={selectedHotel} onChange={(e) => setSelectedHotel(e.target.value)}>
            <option value="">Select a hotel…</option>
            {hotels.filter((h) => !h.topSecret).map((h) => (
              <option key={h.id} value={h.id}>{h.name} — {h.neighborhood} · ${h.pricing?.final}/night</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary" style={{ padding: 13 }}>Create group & get invite link</button>
      </form>
    </div>
  );
}
