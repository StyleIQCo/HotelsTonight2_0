import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';

// ─── Partner Agreement text ────────────────────────────────────────────────
// NOTE FOR PRODUCTION: This draft was written to cover the material terms of
// a standard OTA partner agreement. Have a licensed hospitality attorney
// review and finalize before collecting binding signatures from real partners.
const AGREEMENT_TEXT = `HOTEL PARTNER AGREEMENT
Last updated: April 21, 2026

This Hotel Partner Agreement ("Agreement") is entered into as of the date of electronic
acceptance ("Effective Date") between NightDrop, Inc., a Delaware corporation
("Platform"), and the hotel property identified in the accompanying application form
("Partner Property" or "Partner").

1. SERVICES AND SCOPE
   Platform operates a technology marketplace connecting travelers with same-day hotel
   inventory at discounted rates ("Service"). By executing this Agreement, Partner agrees
   to make available unsold room inventory through the Service on the terms set forth herein.

2. COMMISSION AND FEES
   2.1  Partner agrees to pay Platform a commission equal to fifteen percent (15%) of the
        net room rate (excluding taxes and mandatory fees) for each confirmed booking
        completed through the Service.
   2.2  Platform will remit the remaining eighty-five percent (85%) of collected room
        revenue to Partner via ACH transfer within thirty (30) calendar days following
        each guest's checkout date, less any refunds issued under Section 6.
   2.3  No setup fee, listing fee, or monthly subscription fee is charged. Platform's
        sole compensation is the commission described in 2.1.

3. RATE REQUIREMENTS AND RATE PARITY
   3.1  Partner agrees that rates made available through the Service shall be at least
        ten percent (10%) below Partner's publicly available Best Available Rate (BAR)
        for the equivalent room type on the same arrival date, effective no earlier than
        6:00 PM local time at the Partner's property.
   3.2  Partner represents that rates submitted to Platform comply with any rate-parity
        obligations Partner holds with other distribution channels.

4. INVENTORY COMMITMENTS
   4.1  Partner may elect, at its sole discretion, how many rooms to make available
        through the Service on any given night, including zero.
   4.2  Once a room is confirmed to a guest, Partner agrees to honor that reservation
        regardless of subsequent changes in occupancy demand.
   4.3  Partner agrees not to walk (relocate) a NightDrop guest to an alternative
        property without prior Platform approval, except in cases of force majeure or
        property emergency.

5. CANCELLATION POLICY
   5.1  Standard policy: guests may cancel for a full refund up to four (4) hours
        before the property's published check-in time.
   5.2  Cancellations received within four (4) hours of check-in, and no-shows, are
        non-refundable. Partner receives eighty-five percent (85%) of the room charge.
   5.3  Platform reserves the right to issue discretionary refunds for documented service
        failures (uninhabitable room, safety hazard, etc.) and will deduct such refunds
        from Partner's next remittance.

6. PROPERTY STANDARDS
   6.1  Partner represents and warrants that its property: (a) holds all required local,
        state, and federal operating licenses; (b) meets applicable fire safety and
        accessibility codes; (c) maintains general liability insurance of at least
        $1,000,000 per occurrence; and (d) employs a staffed front desk during all
        advertised check-in hours.
   6.2  Platform may inspect, or request photographic evidence of, any property at any
        time. Failure to meet stated standards is grounds for immediate suspension.

7. NON-DISCRIMINATION
   Partner agrees to provide equal treatment to all guests without regard to race, color,
   religion, sex, national origin, disability, familial status, sexual orientation, gender
   identity, or any other characteristic protected by applicable law. Violation of this
   section is grounds for immediate and permanent termination.

8. DATA AND PRIVACY
   8.1  Platform will share with Partner only the guest information necessary to fulfill
        the reservation (name, expected arrival time, room type). Full payment card data
        is never shared with Partner.
   8.2  Partner agrees not to use guest contact information provided by Platform for
        any purpose other than fulfilling the specific reservation.
   8.3  Platform may use aggregated, anonymized booking data for internal analytics,
        product improvement, and market-rate reporting.

9. INTELLECTUAL PROPERTY
   Partner grants Platform a non-exclusive, royalty-free license to display Partner's
   property name, photographs, amenity descriptions, and brand marks solely for the
   purpose of listing the property on the Service. Platform grants Partner no right
   to use Platform's trademarks without prior written consent.

10. TERM AND TERMINATION
    10.1  This Agreement commences on the Effective Date and continues for twelve (12)
          months, renewing automatically for successive one-year terms unless terminated.
    10.2  Either party may terminate this Agreement without cause upon thirty (30) days'
          written notice to the other party.
    10.3  Platform may terminate immediately upon written notice if Partner: (a) violates
          Section 7 (non-discrimination); (b) walks a guest in violation of Section 4.3;
          (c) makes materially false representations in the application; or (d) becomes
          insolvent or ceases normal business operations.
    10.4  Upon termination, all confirmed future reservations must be honored. Platform
          will continue remitting revenue for reservations made prior to the termination date.

11. LIMITATION OF LIABILITY
    EXCEPT FOR CLAIMS ARISING FROM FRAUD, GROSS NEGLIGENCE, OR WILLFUL MISCONDUCT,
    PLATFORM'S AGGREGATE LIABILITY TO PARTNER SHALL NOT EXCEED THE TOTAL COMMISSIONS
    EARNED BY PLATFORM IN THE THIRTY (30) DAYS PRECEDING THE CLAIM. NEITHER PARTY
    SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.

12. INDEMNIFICATION
    Each party shall indemnify and hold harmless the other from any third-party claims,
    damages, or expenses (including reasonable attorneys' fees) arising from the
    indemnifying party's breach of this Agreement or its own negligence or misconduct.

13. GOVERNING LAW AND DISPUTES
    This Agreement is governed by the laws of the State of Delaware, without regard to
    conflict-of-law principles. Any dispute that cannot be resolved informally shall be
    submitted to binding arbitration under the AAA Commercial Arbitration Rules in
    Wilmington, Delaware, before a single arbitrator. The prevailing party is entitled
    to recover reasonable attorneys' fees.

14. ENTIRE AGREEMENT
    This Agreement, together with any addenda signed by both parties, constitutes the
    entire agreement between the parties regarding its subject matter and supersedes all
    prior negotiations, representations, and agreements. Amendments require written
    consent of both parties.

15. ELECTRONIC SIGNATURE
    The parties agree that electronic acceptance of this Agreement (by typing a name
    and checking the boxes below) constitutes a valid, binding signature under the
    Electronic Signatures in Global and National Commerce Act (ESIGN) and applicable
    state law.

──────────────────────────────────────────────────────────────────
NightDrop, Inc.
Authorized Signatory: Sarah Chen, CEO
Date: April 21, 2026
──────────────────────────────────────────────────────────────────`;

const STEPS = ['Property', 'Contact', 'Preview', 'Agreement'];

const PROPERTY_TYPES = [
  'Full-Service Hotel',
  'Boutique Hotel',
  'Resort',
  'Extended Stay',
  'B&B / Inn',
  'Conference Hotel',
];

const HEAR_SOURCES = [
  'Google search',
  'LinkedIn',
  'Industry publication',
  'Referral from another hotel',
  'Trade show / conference',
  'Other',
];

function StepIndicator({ current }) {
  return (
    <div className="wizard-steps">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`wizard-step ${i < current ? 'done' : i === current ? 'active' : ''}`}>
            <div className="wizard-dot">{i < current ? '✓' : i + 1}</div>
            <span className="wizard-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`wizard-line${i < current ? ' done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Step 1: Property info ─────────────────────────────────────────────────
function StepProperty({ data, setData, onNext }) {
  function field(key) {
    return { value: data[key] || '', onChange: (e) => setData((d) => ({ ...d, [key]: e.target.value })) };
  }
  const valid = data.propertyName && data.propertyType && data.stars && data.rooms && data.city && data.state;

  return (
    <div className="wizard-body">
      <h2 className="wizard-title">Tell us about your property</h2>
      <p className="wizard-sub">Takes about 2 minutes. No credit card required.</p>

      <div className="field">
        <label>Property name *</label>
        <input className="input" placeholder="e.g. The Grand Bellevue Hotel" {...field('propertyName')} />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Property type *</label>
          <select className="input" {...field('propertyType')}>
            <option value="">Select type…</option>
            {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Star rating *</label>
          <select className="input" {...field('stars')}>
            <option value="">Select…</option>
            {[3, 4, 5].map((s) => <option key={s} value={s}>{s} stars</option>)}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Total rooms *</label>
          <input className="input" type="number" min={1} max={5000} placeholder="e.g. 120" {...field('rooms')} />
        </div>
        <div className="field">
          <label>Rooms you'd list nightly</label>
          <input className="input" type="number" min={1} placeholder="e.g. 20" {...field('listRooms')} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>City *</label>
          <input className="input" placeholder="e.g. Seattle" {...field('city')} />
        </div>
        <div className="field" style={{ flex: '0 0 100px' }}>
          <label>State *</label>
          <input className="input" placeholder="WA" maxLength={2} {...field('state')} style={{ textTransform: 'uppercase' }} />
        </div>
      </div>

      <div className="field">
        <label>Property website</label>
        <input className="input" type="url" placeholder="https://yourhotel.com" {...field('website')} />
      </div>

      <button className="btn-primary wizard-next" disabled={!valid} onClick={onNext}>
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2: Contact info ──────────────────────────────────────────────────
function StepContact({ data, setData, onNext, onBack }) {
  function field(key) {
    return { value: data[key] || '', onChange: (e) => setData((d) => ({ ...d, [key]: e.target.value })) };
  }
  const valid = data.firstName && data.lastName && data.email && data.phone && data.title;

  return (
    <div className="wizard-body">
      <h2 className="wizard-title">Your contact information</h2>
      <p className="wizard-sub">We'll use this to reach you during onboarding and send your remittance reports.</p>

      <div className="field-row">
        <div className="field">
          <label>First name *</label>
          <input className="input" placeholder="Jane" {...field('firstName')} />
        </div>
        <div className="field">
          <label>Last name *</label>
          <input className="input" placeholder="Smith" {...field('lastName')} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Title / role *</label>
          <input className="input" placeholder="Director of Revenue" {...field('title')} />
        </div>
      </div>

      <div className="field">
        <label>Work email *</label>
        <input className="input" type="email" placeholder="jane@yourhotel.com" {...field('email')} />
      </div>

      <div className="field">
        <label>Phone number *</label>
        <input className="input" type="tel" placeholder="+1 (555) 000-0000" {...field('phone')} />
      </div>

      <div className="field">
        <label>How did you hear about us?</label>
        <select className="input" {...field('hearSource')}>
          <option value="">Select…</option>
          {HEAR_SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="wizard-nav">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn-primary wizard-next" disabled={!valid} onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Revenue preview ────────────────────────────────────────────────
function StepPreview({ data, onNext, onBack }) {
  const rooms = Number(data.listRooms || Math.round(data.rooms * 0.2) || 10);
  const avgRate = 200;
  const nights = 20;
  const gross = rooms * avgRate * nights;
  const yourCut = Math.round(gross * 0.85);
  const ourCut = gross - yourCut;

  return (
    <div className="wizard-body">
      <h2 className="wizard-title">Your revenue preview</h2>
      <p className="wizard-sub">
        Based on {rooms} rooms listed per night at a conservative ${avgRate}/night average,
        participating {nights} nights/month:
      </p>

      <div className="preview-card">
        <div className="preview-hotel-name">{data.propertyName}</div>
        <div className="preview-location">{'★'.repeat(Number(data.stars))} · {data.city}, {data.state}</div>

        <div style={{ marginTop: 20 }}>
          <div className="preview-row">
            <span>Gross room revenue</span>
            <span>${gross.toLocaleString()}/mo</span>
          </div>
          <div className="preview-row">
            <span>NightDrop commission (15%)</span>
            <span style={{ color: 'var(--accent)' }}>−${ourCut.toLocaleString()}/mo</span>
          </div>
          <div className="preview-row preview-row-total">
            <span>You receive</span>
            <span style={{ color: 'var(--good)' }}>${yourCut.toLocaleString()}/mo</span>
          </div>
        </div>

        <div className="preview-note">
          This is revenue from rooms that would otherwise go unsold. Your existing channels
          are unaffected.
        </div>
      </div>

      <div className="preview-perks">
        {['No setup fee', 'No exclusivity', 'Cancel anytime', 'ACH payout in 30 days'].map((p) => (
          <div key={p} className="preview-perk">✅ {p}</div>
        ))}
      </div>

      <div className="wizard-nav">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn-primary wizard-next" onClick={onNext}>
          Review & sign agreement →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Agreement + signature ────────────────────────────────────────
function StepAgreement({ data, setData, onSubmit, onBack, loading }) {
  const scrollRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) setScrolled(true);
  }

  const sigName = data.sigName || '';
  const canSubmit = scrolled && checked1 && checked2 && sigName.trim().length > 3 && !loading;

  return (
    <div className="wizard-body">
      <h2 className="wizard-title">Partner Agreement</h2>
      <p className="wizard-sub">
        Read the full agreement below. You must scroll to the bottom before signing.
      </p>

      <div className="agreement-scroll" ref={scrollRef} onScroll={handleScroll}>
        <pre className="agreement-text">{AGREEMENT_TEXT}</pre>
      </div>
      {!scrolled && (
        <div className="agreement-scroll-hint">↓ Scroll to the bottom to enable signing</div>
      )}

      <div className="agreement-checks" style={{ opacity: scrolled ? 1 : 0.4, pointerEvents: scrolled ? 'auto' : 'none' }}>
        <label className="check-row">
          <input type="checkbox" checked={checked1} onChange={(e) => setChecked1(e.target.checked)} />
          <span>
            I confirm I have legal authority to enter into this Agreement on behalf of
            <strong> {data.propertyName || 'my property'}</strong>.
          </span>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={checked2} onChange={(e) => setChecked2(e.target.checked)} />
          <span>
            I have read and understand the NightDrop Hotel Partner Agreement and agree
            to be legally bound by its terms.
          </span>
        </label>
      </div>

      <div className="field" style={{ marginTop: 16, opacity: scrolled ? 1 : 0.4, pointerEvents: scrolled ? 'auto' : 'none' }}>
        <label>Electronic signature — type your full legal name *</label>
        <input
          className="input sig-input"
          placeholder="Jane M. Smith"
          value={sigName}
          onChange={(e) => setData((d) => ({ ...d, sigName: e.target.value }))}
        />
        {sigName && (
          <div className="sig-preview">{sigName}</div>
        )}
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
          Your typed name constitutes a legally binding electronic signature under ESIGN and UETA.
        </div>
      </div>

      <div className="wizard-nav">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button
          className="btn-primary wizard-next"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {loading ? 'Submitting…' : '✅ Submit application'}
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Confirmation ──────────────────────────────────────────────────
function StepConfirmation({ data, refId }) {
  return (
    <div className="wizard-body confirmation-body">
      <div className="confirm-icon">🎉</div>
      <h2 className="wizard-title">Application received!</h2>
      <p className="wizard-sub">
        We've received your application for <strong>{data.propertyName}</strong>.
        Our partner team will reach out to <strong>{data.email}</strong> within 2 business days.
      </p>

      <div className="confirm-ref">
        Application ID: <strong>{refId}</strong>
      </div>

      <div className="timeline">
        <h3>What happens next</h3>
        {[
          { day: 'Days 1–2', text: 'Our team reviews your application and verifies property details.' },
          { day: 'Days 3–5', text: 'We set up your dashboard, verify photos, and configure your pricing floors.' },
          { day: 'Day 7', text: 'You go live. First bookings can arrive within hours of launch.' },
          { day: 'Day 37+', text: 'First ACH remittance arrives — 85% of all bookings from your first 30 days.' },
        ].map((t) => (
          <div key={t.day} className="timeline-row">
            <div className="timeline-dot" />
            <div>
              <div className="timeline-day">{t.day}</div>
              <div className="timeline-text">{t.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="wizard-nav" style={{ justifyContent: 'center', gap: 12 }}>
        <Link to="/" className="btn-ghost">Back to tonight's deals</Link>
        <Link to="/partners" className="btn-primary">View partner dashboard →</Link>
      </div>
    </div>
  );
}

// ─── Main wizard ───────────────────────────────────────────────────────────
export default function PartnerApplyPage() {
  const { addLead } = useApp();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [refId, setRefId] = useState(null);

  async function handleSubmit() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900)); // simulate API call
    const id = addLead({
      propertyName: data.propertyName,
      propertyType: data.propertyType,
      stars: Number(data.stars),
      rooms: Number(data.rooms),
      city: data.city,
      state: data.state,
      website: data.website || '',
      contactName: `${data.firstName} ${data.lastName}`,
      title: data.title,
      email: data.email,
      phone: data.phone,
      hearSource: data.hearSource || '',
      sigName: data.sigName,
      agreedAt: new Date().toISOString(),
    });
    setRefId(id);
    setLoading(false);
    setStep(4);
  }

  if (step === 4) return (
    <div className="wizard-container">
      <StepConfirmation data={data} refId={refId} />
    </div>
  );

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <Link to="/for-hotels" className="wizard-back-link">← Partner program</Link>
        <StepIndicator current={step} />
      </div>

      {step === 0 && <StepProperty data={data} setData={setData} onNext={() => setStep(1)} />}
      {step === 1 && <StepContact data={data} setData={setData} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <StepPreview data={data} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && (
        <StepAgreement
          data={data}
          setData={setData}
          onSubmit={handleSubmit}
          onBack={() => setStep(2)}
          loading={loading}
        />
      )}
    </div>
  );
}
