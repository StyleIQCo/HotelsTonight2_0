import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { priceHotel } from '../lib/pricing.js';
import TimeSimulator from '../components/TimeSimulator.jsx';

const STATUS_COLORS = { new: '#6a3aff', reviewing: '#ffb84d', approved: '#37d6a0', rejected: '#ff4d6d' };
const STATUS_LABELS = { new: 'New', reviewing: 'Reviewing', approved: 'Approved', rejected: 'Rejected' };

export default function PartnerDashboard() {
  const {
    rawHotels, updateHotel, bookings, now, pricingConfig, setPricingConfig,
    notificationsOn, setNotificationsOn, leads
  } = useApp();
  const [selectedId, setSelectedId] = useState(rawHotels[0]?.id || '');
  const selected = rawHotels.find((h) => h.id === selectedId);

  // Partners see an "active inventory" preview with the live discount applied.
  const priced = useMemo(
    () => rawHotels.map((h) => ({ ...h, pricing: priceHotel(h, now, pricingConfig) })),
    [rawHotels, now, pricingConfig]
  );

  const totalRevenue = bookings.reduce((sum, b) => sum + b.priceUSD, 0);
  const roomsSoldTonight = bookings.length;
  const avgDiscount = priced.length
    ? priced.reduce((s, h) => s + h.pricing.totalPct, 0) / priced.length
    : 0;

  return (
    <>
      <div className="hero" style={{ padding: '30px 0 8px', textAlign: 'left' }}>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>Partner Dashboard</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          Move rooms tonight. Set vacancy, tune your discount guardrails, watch bookings roll in.
        </p>
      </div>

      {/* Partner Applications Inbox */}
      {leads.length > 0 ? (
        <div className="detail-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>
              📬 Partner Applications
              <span className="leads-badge">{leads.filter(l => l.status === 'new').length} new</span>
            </h3>
            <Link to="/partner-apply" className="btn-ghost" style={{ fontSize: 13, padding: '6px 14px' }}>
              + Add property
            </Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Property</th>
                <th>Location</th>
                <th>Rooms</th>
                <th>Contact</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td><code style={{ fontSize: 12 }}>{lead.id}</code></td>
                  <td>
                    <strong>{lead.propertyName}</strong>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {'★'.repeat(lead.stars)} {lead.propertyType}
                    </div>
                  </td>
                  <td>{lead.city}, {lead.state}</td>
                  <td>{lead.rooms}</td>
                  <td>
                    <div style={{ fontSize: 13 }}>{lead.contactName}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{lead.email}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {new Date(lead.submittedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className="lead-status" style={{ background: STATUS_COLORS[lead.status] + '22', color: STATUS_COLORS[lead.status], border: `1px solid ${STATUS_COLORS[lead.status]}44` }}>
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="detail-card leads-empty" style={{ marginBottom: 24 }}>
          <div>📬 No partner applications yet.</div>
          <Link to="/partner-apply" className="btn-primary" style={{ marginTop: 10, display: 'inline-block', padding: '10px 20px' }}>
            Submit a test application →
          </Link>
        </div>
      )}

      <TimeSimulator />

      <div className="kpi-row">
        <div className="kpi">
          <div className="val">{roomsSoldTonight}</div>
          <div className="lbl">Rooms sold tonight</div>
        </div>
        <div className="kpi">
          <div className="val">${totalRevenue}</div>
          <div className="lbl">Revenue captured</div>
        </div>
        <div className="kpi">
          <div className="val">{Math.round(avgDiscount * 100)}%</div>
          <div className="lbl">Avg. discount across network</div>
        </div>
        <div className="kpi">
          <div className="val">{priced.length}</div>
          <div className="lbl">Partner hotels live</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3 style={{ marginTop: 0 }}>Tonight's active inventory</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Vacancy</th>
                <th>Rack</th>
                <th>Tonight</th>
                <th>Discount</th>
              </tr>
            </thead>
            <tbody>
              {priced.map((h) => (
                <tr key={h.id} onClick={() => setSelectedId(h.id)} style={{ cursor: 'pointer' }}>
                  <td>{h.name}</td>
                  <td>{Math.round(h.vacancyRate * 100)}%</td>
                  <td>${h.rackRate}</td>
                  <td>${h.pricing.final}</td>
                  <td style={{ color: h.pricing.totalPct > 0.15 ? 'var(--good)' : 'var(--muted)' }}>
                    {Math.round(h.pricing.totalPct * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bookings.length > 0 && (
            <>
              <h3 style={{ marginTop: 24 }}>Recent bookings</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Hotel</th>
                    <th>Guest</th>
                    <th>Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b.id}>
                      <td><code>{b.id}</code></td>
                      <td>{b.hotelName}</td>
                      <td>{b.guestName}</td>
                      <td>${b.priceUSD}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <aside>
          {selected && (
            <div className="detail-card">
              <h3 style={{ marginTop: 0 }}>Adjust {selected.name}</h3>
              <div className="field">
                <label>Vacancy tonight: {Math.round(selected.vacancyRate * 100)}%</label>
                <input
                  type="range"
                  className="slider"
                  min={0} max={100} step={1}
                  value={Math.round(selected.vacancyRate * 100)}
                  onChange={(e) =>
                    updateHotel(selected.id, { vacancyRate: Number(e.target.value) / 100 })
                  }
                />
              </div>
              <div className="field">
                <label>Rack rate: ${selected.rackRate}</label>
                <input
                  type="range"
                  className="slider"
                  min={99} max={799} step={1}
                  value={selected.rackRate}
                  onChange={(e) => updateHotel(selected.id, { rackRate: Number(e.target.value) })}
                />
              </div>
            </div>
          )}

          <div className="detail-card" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Network-wide rules</h3>
            <div className="field">
              <label>
                Max late-check-in discount: {Math.round(pricingConfig.maxLatePct * 100)}%
              </label>
              <input
                type="range"
                className="slider"
                min={0} max={50} step={1}
                value={Math.round(pricingConfig.maxLatePct * 100)}
                onChange={(e) =>
                  setPricingConfig({
                    ...pricingConfig,
                    maxLatePct: Number(e.target.value) / 100
                  })
                }
              />
            </div>
            <div className="field">
              <label>
                Max vacancy discount: {Math.round(pricingConfig.maxVacancyPct * 100)}%
              </label>
              <input
                type="range"
                className="slider"
                min={0} max={50} step={1}
                value={Math.round(pricingConfig.maxVacancyPct * 100)}
                onChange={(e) =>
                  setPricingConfig({
                    ...pricingConfig,
                    maxVacancyPct: Number(e.target.value) / 100
                  })
                }
              />
            </div>
            <div className="field">
              <label>Floor (never discount more than): {Math.round(pricingConfig.floorPct * 100)}%</label>
              <input
                type="range"
                className="slider"
                min={20} max={70} step={1}
                value={Math.round(pricingConfig.floorPct * 100)}
                onChange={(e) =>
                  setPricingConfig({
                    ...pricingConfig,
                    floorPct: Number(e.target.value) / 100
                  })
                }
              />
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={notificationsOn}
                  onChange={(e) => setNotificationsOn(e.target.checked)}
                />
                Send marketing pushes when deals cross 25% off
              </label>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
