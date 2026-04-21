import React from 'react';
import { lateCheckInDiscount, vacancyDiscount, PRICING_DEFAULTS } from '../lib/pricing.js';

// SVG sparkline showing tonight's discounted price across all 24 hours.
// The curve drops after prime-time hour and flattens at the floor discount.
export default function PriceSparkline({ hotel, width = 120, height = 36, showLabel = false }) {
  const cfg = PRICING_DEFAULTS;

  const prices = Array.from({ length: 24 }, (_, h) => {
    const late = lateCheckInDiscount(h, cfg);
    const vac  = vacancyDiscount(hotel.vacancyRate, cfg);
    const total = Math.min(late + vac, cfg.floorPct);
    return Math.round(hotel.rackRate * (1 - total));
  });

  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const pad = 3;

  const toY = (p) => pad + ((maxP - p) / range) * (height - pad * 2);
  const toX = (i) => (i / 23) * width;

  const path = prices.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p).toFixed(1)}`).join(' ');

  const nowH  = new Date().getHours();
  const cx    = toX(nowH);
  const cy    = toY(prices[nowH]);
  const isDiscount = prices[nowH] < maxP;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
        aria-label={`Price sparkline: $${minP} – $${maxP} tonight`}
      >
        {/* Fill area under curve */}
        <path
          d={`${path} L${toX(23)},${height} L${toX(0)},${height} Z`}
          fill={isDiscount ? 'rgba(55,214,160,0.08)' : 'rgba(255,77,109,0.06)'}
        />
        {/* Main curve */}
        <path
          d={path}
          fill="none"
          stroke={isDiscount ? 'var(--good)' : 'var(--muted)'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Current-hour dot */}
        <circle cx={cx} cy={cy} r="3.5" fill={isDiscount ? 'var(--good)' : 'var(--accent)'} />
      </svg>
      {showLabel && (
        <span style={{ fontSize: 11, color: isDiscount ? 'var(--good)' : 'var(--muted)' }}>
          ${prices[nowH]}/night now
        </span>
      )}
    </div>
  );
}
