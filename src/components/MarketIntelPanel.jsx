import React, { useMemo } from 'react';
import { getMarketIntelligence, getWeeklyForecast } from '../lib/marketIntelligence.js';

function DemandBar({ bar, color }) {
  return (
    <div className="intel-bar-wrap">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="intel-bar-seg"
          style={{ background: n <= bar ? color : 'var(--border)' }}
        />
      ))}
    </div>
  );
}

function WeekForecast({ hotel }) {
  const forecast = useMemo(() => getWeeklyForecast(hotel), [hotel]);

  return (
    <div className="intel-week">
      {forecast.map((day, i) => (
        <div key={i} className="intel-week-day">
          <div className="intel-week-label">{day.day}</div>
          <div
            className="intel-week-bar"
            style={{
              height: `${Math.round((day.multiplier - 0.5) / 1.5 * 48) + 4}px`,
              background: day.demand.color,
              opacity: i === 0 ? 1 : 0.65 + i * 0.05
            }}
            title={`${day.demand.label} · ${day.topFactor ? day.topFactor.label : 'No major events'}`}
          />
          <div className="intel-week-level" style={{ color: day.demand.color }}>
            {['', 'Lo', 'Avg', 'Hi', '🔥'][day.demand.bar]}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketIntelPanel({ hotel }) {
  const intel = useMemo(() => getMarketIntelligence(hotel), [hotel]);

  const directionIcon = { up: '📈', down: '📉', stable: '➡️' }[intel.priceDirection];
  const directionText = {
    up:     'Demand rising — prices likely higher in 4 days',
    down:   'Demand easing — better rates may come',
    stable: 'Demand steady — prices expected to hold',
  }[intel.priceDirection];

  return (
    <div className="intel-panel">
      <div className="intel-header">
        <span className="intel-title">🤖 Market Intelligence</span>
        <span className="intel-city">{intel.city}</span>
      </div>

      {/* Demand level */}
      <div className="intel-demand-row">
        <div>
          <div className="intel-demand-label" style={{ color: intel.demand.color }}>
            {intel.demand.label}
          </div>
          <DemandBar bar={intel.demand.bar} color={intel.demand.color} />
        </div>
        <div className="intel-direction">
          <span>{directionIcon}</span>
          <span className="intel-direction-text">{directionText}</span>
        </div>
      </div>

      {/* Active factors */}
      {intel.factors.length > 0 && (
        <div className="intel-factors">
          {intel.factors.map((f, i) => (
            <span
              key={i}
              className={`intel-factor${f.positive ? ' intel-factor-good' : ''}`}
              title={`${f.positive ? 'Lower' : 'Higher'} demand impact: ${Math.round(f.impact * 100)}%`}
            >
              {f.emoji} {f.label}
              {f.isActive && <span className="intel-live">LIVE</span>}
            </span>
          ))}
        </div>
      )}

      {intel.factors.length === 0 && (
        <p className="intel-no-factors">No major events or holidays this week.</p>
      )}

      {/* 7-day demand forecast */}
      <div className="intel-forecast-label">7-day demand forecast</div>
      <WeekForecast hotel={hotel} />

      {/* Recommendation */}
      <div className="intel-recommendation">
        {intel.demand.bar >= 3 ? (
          <><span>🔒</span> High demand detected — tonight's rate is likely the best you'll find this week.</>
        ) : intel.demand.bar <= 1 ? (
          <><span>💡</span> Low-demand period — you may find rates hold or improve over the next few days.</>
        ) : (
          <><span>✅</span> Demand is stable — booking tonight locks in the current discount with no risk.</>
        )}
      </div>
    </div>
  );
}
