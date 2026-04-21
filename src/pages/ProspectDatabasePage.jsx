import React, { useMemo, useState } from 'react';
import { useApp } from '../store.jsx';
import { PIPELINE_STAGES, PRIORITY_CONFIG } from '../data/prospects.js';

const CITIES = ['All', 'Seattle', 'Bellevue', 'New York', 'Las Vegas', 'Los Angeles', 'San Francisco'];
const PRIORITIES = ['all', 'high', 'medium', 'low'];

// ── Email template generator ───────────────────────────────────────────────
function generateEmail(p) {
  return `Subject: Partnership opportunity — fill your unsold rooms, tonight

Hi ${p.contactName ? p.contactName.split(' ')[0] : '[Name]'},

My name is [Your Name] and I'm reaching out from HotelsTonight — a last-minute booking platform connecting travelers with same-day hotel rooms in ${p.city}.

I came across ${p.name} and was genuinely impressed by ${p.publicRating.split('·')[0].trim().toLowerCase()}. We work with independent boutique hotels to fill unsold rooms each evening at rates the hotel controls, with zero setup fee and an 85/15 commission split in your favor.

A few things that might be relevant for ${p.name}:

• You set your own floor rate — we never discount below it
• Free to join, no monthly fees, no exclusivity required
• Rooms unsold by 6 PM tonight become available on our platform automatically
• Revenue remitted to your account within 30 days of each checkout

We currently have travelers searching in ${p.city} every night and no partner in your neighborhood yet.

Would you be open to a quick 15-minute call this week to explore whether it's a fit?

Best,
[Your Name]
HotelsTonight
[Your phone number]
https://hotelstonight.com/for-hotels`;
}

// ── Prospect detail side panel ─────────────────────────────────────────────
function DetailPanel({ prospect, onClose, updateProspect, addOutreach }) {
  const [editContact, setEditContact] = useState(false);
  const [contact, setContact] = useState({
    contactName: prospect.contactName,
    contactTitle: prospect.contactTitle,
    contactEmail: prospect.contactEmail,
    contactPhone: prospect.contactPhone,
  });
  const [notes, setNotes] = useState(prospect.notes);
  const [outreachNote, setOutreachNote] = useState('');
  const [outreachType, setOutreachType] = useState('email');
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  const stage = PIPELINE_STAGES.find((s) => s.key === prospect.status);
  const priority = PRIORITY_CONFIG[prospect.priority];

  function saveContact() {
    updateProspect(prospect.id, contact);
    setEditContact(false);
  }

  function saveNotes() {
    updateProspect(prospect.id, { notes });
  }

  function logOutreach() {
    if (!outreachNote.trim()) return;
    addOutreach(prospect.id, { type: outreachType, note: outreachNote.trim() });
    setOutreachNote('');
  }

  function copyEmail() {
    navigator.clipboard.writeText(generateEmail(prospect));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="crm-panel-backdrop" onClick={onClose}>
      <aside className="crm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="crm-panel-header">
          <div>
            <div className="crm-panel-name">{prospect.name}</div>
            <div className="crm-panel-meta">
              {'★'.repeat(prospect.stars)} · {prospect.neighborhood}, {prospect.city} · {prospect.rooms} rooms
            </div>
          </div>
          <button className="crm-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Status + Priority */}
        <div className="crm-panel-row">
          <div className="field" style={{ flex: 1 }}>
            <label>Pipeline stage</label>
            <select
              className="input"
              value={prospect.status}
              onChange={(e) => updateProspect(prospect.id, { status: e.target.value })}
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Priority</label>
            <select
              className="input"
              value={prospect.priority}
              onChange={(e) => updateProspect(prospect.id, { priority: e.target.value })}
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.dot} {v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Property info */}
        <div className="crm-section">
          <div className="crm-section-title">Property</div>
          <div className="crm-info-row"><span>Type</span><span>{prospect.type}</span></div>
          <div className="crm-info-row"><span>Rooms</span><span>{prospect.rooms}</span></div>
          <div className="crm-info-row"><span>Rating</span><span style={{ fontSize: 12 }}>{prospect.publicRating}</span></div>
          <div className="crm-info-row">
            <span>Website</span>
            <a href={prospect.website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 13 }}>
              {prospect.website.replace('https://', '')} ↗
            </a>
          </div>
        </div>

        {/* Pitch */}
        <div className="crm-section">
          <div className="crm-section-title">Why they're a fit</div>
          <p className="crm-pitch">{prospect.pitch}</p>
        </div>

        {/* Contact info */}
        <div className="crm-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="crm-section-title">Contact</div>
            <button className="crm-edit-btn" onClick={() => setEditContact((v) => !v)}>
              {editContact ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>
          {editContact ? (
            <div>
              {[
                ['contactName', 'Full name'],
                ['contactTitle', 'Title'],
                ['contactEmail', 'Email'],
                ['contactPhone', 'Phone'],
              ].map(([key, lbl]) => (
                <div className="field" key={key}>
                  <label>{lbl}</label>
                  <input
                    className="input"
                    value={contact[key]}
                    onChange={(e) => setContact((c) => ({ ...c, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <button className="btn-primary" style={{ width: '100%', padding: 10 }} onClick={saveContact}>
                Save contact
              </button>
            </div>
          ) : (
            <div>
              {prospect.contactName
                ? <>
                    <div className="crm-info-row"><span>Name</span><span>{prospect.contactName}</span></div>
                    <div className="crm-info-row"><span>Title</span><span>{prospect.contactTitle || '—'}</span></div>
                    <div className="crm-info-row"><span>Email</span><span>{prospect.contactEmail || '—'}</span></div>
                    <div className="crm-info-row"><span>Phone</span><span>{prospect.contactPhone || '—'}</span></div>
                  </>
                : <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>No contact added yet — click Edit to add.</p>
              }
            </div>
          )}
        </div>

        {/* Email template */}
        <div className="crm-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="crm-section-title">Outreach email</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="crm-edit-btn" onClick={() => setShowEmail((v) => !v)}>
                {showEmail ? 'Hide' : 'Preview'}
              </button>
              <button className="crm-edit-btn" onClick={copyEmail}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
          {showEmail && (
            <pre className="crm-email-preview">{generateEmail(prospect)}</pre>
          )}
        </div>

        {/* Notes */}
        <div className="crm-section">
          <div className="crm-section-title">Internal notes</div>
          <textarea
            className="input crm-notes"
            rows={3}
            placeholder="Add notes about this prospect…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
          />
        </div>

        {/* Outreach log */}
        <div className="crm-section">
          <div className="crm-section-title">Log outreach activity</div>
          <div className="crm-panel-row">
            <select
              className="input"
              style={{ flex: '0 0 110px' }}
              value={outreachType}
              onChange={(e) => setOutreachType(e.target.value)}
            >
              {['email', 'call', 'LinkedIn', 'meeting', 'other'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input
              className="input"
              placeholder="What happened? (e.g. Left voicemail with GM)"
              value={outreachNote}
              onChange={(e) => setOutreachNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && logOutreach()}
            />
            <button className="btn-primary" style={{ flexShrink: 0, padding: '10px 14px' }} onClick={logOutreach}>
              Log
            </button>
          </div>

          {prospect.outreach.length > 0 && (
            <div className="crm-log">
              {prospect.outreach.map((e, i) => (
                <div key={i} className="crm-log-entry">
                  <span className="crm-log-type">{e.type}</span>
                  <span className="crm-log-note">{e.note}</span>
                  <span className="crm-log-date">{new Date(e.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function ProspectDatabasePage() {
  const { prospects, updateProspect, addOutreach } = useApp();
  const [city, setCity] = useState('All');
  const [stageFilter, setStageFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('priority');

  const filtered = useMemo(() => {
    let list = [...prospects];
    if (city !== 'All') list = list.filter((p) => p.city === city);
    if (stageFilter !== 'all') list = list.filter((p) => p.status === stageFilter);
    if (priorityFilter !== 'all') list = list.filter((p) => p.priority === priorityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.neighborhood.toLowerCase().includes(q));
    }
    const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
    if (sortBy === 'priority') list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    else if (sortBy === 'rooms') list.sort((a, b) => b.rooms - a.rooms);
    else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'city') list.sort((a, b) => a.city.localeCompare(b.city));
    return list;
  }, [prospects, city, stageFilter, priorityFilter, search, sortBy]);

  // Pipeline summary counts
  const counts = useMemo(() => {
    const c = {};
    PIPELINE_STAGES.forEach((s) => { c[s.key] = prospects.filter((p) => p.status === s.key).length; });
    return c;
  }, [prospects]);

  const selectedProspect = selected ? prospects.find((p) => p.id === selected) : null;

  return (
    <>
      <div className="hero" style={{ padding: '28px 0 8px', textAlign: 'left' }}>
        <h1 style={{ fontSize: 30, marginBottom: 6 }}>Prospect Database</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          {prospects.length} real independent hotels across {CITIES.length - 1} markets — click any row to manage outreach.
        </p>
      </div>

      {/* Pipeline summary */}
      <div className="pipeline-summary">
        {PIPELINE_STAGES.map((s) => (
          <button
            key={s.key}
            className={`pipeline-pill${stageFilter === s.key ? ' active' : ''}`}
            style={{ '--stage-color': s.color }}
            onClick={() => setStageFilter(stageFilter === s.key ? 'all' : s.key)}
          >
            <span className="pipeline-count">{counts[s.key]}</span>
            <span className="pipeline-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="crm-filters">
        <input
          className="input crm-search"
          placeholder="Search hotel name or neighborhood…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-chips">
          {CITIES.map((c) => (
            <button key={c} className={`filter-chip${city === c ? ' active' : ''}`} onClick={() => setCity(c)}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="filter-label">Priority</span>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              className={`filter-chip${priorityFilter === p ? ' active' : ''}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p === 'all' ? 'All' : `${PRIORITY_CONFIG[p].dot} ${PRIORITY_CONFIG[p].label}`}
            </button>
          ))}
          <span className="filter-label" style={{ marginLeft: 12 }}>Sort</span>
          <select className="input" style={{ padding: '6px 10px', width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">Priority</option>
            <option value="rooms">Room count</option>
            <option value="name">Name A–Z</option>
            <option value="city">City</option>
          </select>
          <span className="filter-result-count">{filtered.length} shown</span>
        </div>
      </div>

      {/* Table */}
      <div className="crm-table-wrap">
        <table className="table crm-table">
          <thead>
            <tr>
              <th>Hotel</th>
              <th>City</th>
              <th>★</th>
              <th>Rooms</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Contact</th>
              <th>Last activity</th>
              <th>Website</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const stage = PIPELINE_STAGES.find((s) => s.key === p.status);
              const pri = PRIORITY_CONFIG[p.priority];
              const lastAct = p.outreach[0];
              return (
                <tr
                  key={p.id}
                  className={`crm-row${selected === p.id ? ' selected' : ''}`}
                  onClick={() => setSelected(selected === p.id ? null : p.id)}
                >
                  <td>
                    <div className="crm-hotel-name">{p.name}</div>
                    <div className="crm-hotel-hood">{p.neighborhood}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{p.city}, {p.state}</td>
                  <td><span className="stars" style={{ letterSpacing: 1, fontSize: 12 }}>{'★'.repeat(p.stars)}</span></td>
                  <td>{p.rooms}</td>
                  <td>
                    <span className="crm-stage-pill" style={{ background: stage.color + '22', color: stage.color, border: `1px solid ${stage.color}44` }}>
                      {stage.label}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ color: pri.color, fontWeight: 700, fontSize: 13 }}>
                      {pri.dot} {pri.label}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: p.contactName ? 'var(--text)' : 'var(--muted)' }}>
                    {p.contactName || 'Not added'}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {lastAct
                      ? <>{lastAct.type}: {lastAct.note.slice(0, 30)}{lastAct.note.length > 30 ? '…' : ''}</>
                      : <span style={{ color: 'var(--border)' }}>No activity</span>
                    }
                  </td>
                  <td>
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--accent)', fontSize: 12 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit ↗
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No prospects match your filters.</p>
            <button className="btn-ghost" onClick={() => { setCity('All'); setStageFilter('all'); setPriorityFilter('all'); setSearch(''); }}>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedProspect && (
        <DetailPanel
          prospect={selectedProspect}
          onClose={() => setSelected(null)}
          updateProspect={updateProspect}
          addOutreach={addOutreach}
        />
      )}
    </>
  );
}
