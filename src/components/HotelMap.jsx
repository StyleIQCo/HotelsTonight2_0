import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { wazeUrl } from '../lib/directions.js';

// Dark-themed OpenStreetMap tiles from CartoDB — free for non-commercial use
// with attribution. Swap to Mapbox/Google tiles later for production.
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
const TILE_ATTRIB =
  '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Pick a pin color based on discount depth so the hottest deals pop.
function pinColor(discountPct) {
  if (discountPct >= 0.25) return '#37d6a0';      // green — fire sale
  if (discountPct >= 0.1) return '#ffb84d';        // amber — noteworthy
  return '#ff4d6d';                                 // brand red — regular
}

function buildPinHtml(label, color) {
  return `
    <div style="
      background:${color};
      color:#0b1220;
      font-weight:800;
      font-size:12px;
      padding:4px 10px;
      border-radius:999px;
      box-shadow:0 4px 12px rgba(0,0,0,.4);
      border:2px solid rgba(255,255,255,.85);
      white-space:nowrap;
      transform:translate(-50%,-100%);
    ">${label}</div>
  `;
}

export default function HotelMap({ hotels, userLocation, onHotelSelect, height = 360 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false
    }).setView([37.8, -96], 4);
    L.tileLayer(DARK_TILES, {
      attribution: TILE_ATTRIB,
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers whenever hotels change.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const bounds = [];
    for (const h of hotels) {
      const discountPct = h.pricing?.totalPct ?? 0;
      const icon = L.divIcon({
        className: 'hotel-pin',
        html: buildPinHtml(`$${h.pricing?.final ?? h.rackRate}`, pinColor(discountPct)),
        iconSize: [0, 0]
      });
      const marker = L.marker([h.lat, h.lng], { icon }).addTo(layer);
      const waze = wazeUrl({ lat: h.lat, lng: h.lng }, { label: h.name });
      marker.bindPopup(`
        <div style="min-width:200px;font-family:inherit;color:#0b1220">
          <div style="font-weight:700;margin-bottom:2px">${h.name}</div>
          <div style="color:#5a6686;font-size:12px;margin-bottom:8px">${h.neighborhood}</div>
          <div style="font-weight:800;font-size:16px;margin-bottom:8px">
            $${h.pricing?.final ?? h.rackRate}/night
            ${discountPct > 0.01 ? `<span style="color:#0f9d6e;font-size:12px;margin-left:6px">${Math.round(discountPct * 100)}% off</span>` : ''}
          </div>
          <div style="display:flex;gap:6px">
            <a href="/hotel/${h.id}" style="background:#ff4d6d;color:#fff;padding:6px 10px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">Book</a>
            <a href="${waze}" target="_blank" rel="noreferrer" style="background:#1a2340;color:#fff;padding:6px 10px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">🚗 Drive</a>
          </div>
        </div>
      `);
      if (onHotelSelect) marker.on('click', () => onHotelSelect(h));
      bounds.push([h.lat, h.lng]);
    }

    if (userLocation) {
      const youIcon = L.divIcon({
        className: 'you-pin',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#4d9fff;border:3px solid #fff;box-shadow:0 0 0 6px rgba(77,159,255,.25)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: youIcon }).addTo(layer);
      bounds.push([userLocation.lat, userLocation.lng]);
    }

    if (bounds.length === 1) {
      map.setView(bounds[0], 12);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [hotels, userLocation, onHotelSelect]);

  return (
    <div
      ref={containerRef}
      className="hotel-map"
      style={{ height, width: '100%', borderRadius: 14, overflow: 'hidden' }}
    />
  );
}
