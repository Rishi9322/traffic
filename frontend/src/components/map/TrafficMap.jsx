import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useReports } from '../../hooks/useReports.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { getMarkerColor, getMarkerSize, buildHeatmapData } from '../../utils/mapHelpers.js';
import { INCIDENT_TYPES } from '../../utils/constants.js';
import { formatTimeAgo } from '../../utils/timeHelpers.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Thermometer, MapPin } from 'lucide-react';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`
    : null;

export default function TrafficMap({ onReportClick, focusLocation }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef({});
    const [mapLoaded, setMapLoaded] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const { reports, fetchReports } = useReports();
    const { coords } = useGeolocation();
    const { user } = useAuth();
    // ── Fly to specific location (e.g. from notification click) ───────────────
    useEffect(() => {
        if (!map.current || !mapLoaded || !focusLocation) return;
        map.current.flyTo({
            center: [focusLocation.lng, focusLocation.lat],
            zoom: 15,
            duration: 1500,
            essential: true
        });
    }, [focusLocation, mapLoaded]);

    // ── Initialize MapLibre GL ────────────────────────────────────────────────
    useEffect(() => {
        // Guard: need style URL, a mounted container div, and no existing map
        if (!MAP_STYLE || !mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: MAP_STYLE,
            center: [78.9629, 22.5937], // India center
            zoom: 4.5,
            attributionControl: false,
            // Render extended Unicode (CJK/math) locally — prevents font 400 errors
            localIdeographFontFamily: ['sans-serif'],
        });

        // Add controls AFTER map loads to avoid StrictMode ref issues
        map.current.once('load', () => {
            if (!map.current) return;
            try {
                map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
                map.current.addControl(
                    new maplibregl.GeolocateControl({
                        positionOptions: { enableHighAccuracy: true },
                        trackUserLocation: true,
                    }),
                    'top-right'
                );
                map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
                map.current.addControl(
                    new maplibregl.AttributionControl({ compact: true }),
                    'bottom-right'
                );
            } catch (e) {
                console.warn('[OSTAS] Map control init warning:', e.message);
            }
            setMapLoaded(true);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
                setMapLoaded(false);
            }
        };
    }, []);

    // ── Fly to user location ──────────────────────────────────────────────────
    useEffect(() => {
        if (!coords || !map.current || !mapLoaded) return;
        map.current.flyTo({ center: [coords.lng, coords.lat], zoom: 13, duration: 2000 });
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.style.cssText = 'width:18px;height:18px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px #3b82f655';
        new maplibregl.Marker({ element: el })
            .setLngLat([coords.lng, coords.lat])
            .addTo(map.current);
    }, [coords, mapLoaded]);

    // ── Fetch reports on mount ────────────────────────────────────────────────
    useEffect(() => { fetchReports(); }, [fetchReports]);

    // ── Render incident markers ───────────────────────────────────────────────
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Remove stale
        Object.entries(markersRef.current).forEach(([id, m]) => {
            if (!reports.find((r) => r.id === id)) { m.remove(); delete markersRef.current[id]; }
        });

        reports.forEach((report) => {
            if (report.status === 'expired') return;
            if (markersRef.current[report.id]) return;

            const size = getMarkerSize(report.congestionLevel);
            const color = getMarkerColor(report.type);
            const typeInfo = INCIDENT_TYPES.find((t) => t.value === report.type);

            const el = document.createElement('div');
            el.style.cssText = `
        width:${size}px;height:${size}px;background:${color};border-radius:50%;
        display:flex;align-items:center;justify-content:center;cursor:pointer;
        box-shadow:0 0 0 3px ${color}33,0 0 14px ${color}66;
        transition:box-shadow 0.15s ease,filter 0.15s ease;
      `;
            el.innerHTML = `<span style="font-size:${size * 0.45}px;line-height:1;pointer-events:none">${typeInfo?.icon || '\u26A0\uFE0F'}</span>`;
            el.addEventListener('mouseenter', () => {
                el.style.boxShadow = `0 0 0 5px ${color}55, 0 0 22px ${color}99`;
                el.style.filter = 'brightness(1.3)';
            });
            el.addEventListener('mouseleave', () => {
                el.style.boxShadow = `0 0 0 3px ${color}33, 0 0 14px ${color}66`;
                el.style.filter = '';
            });

            const popup = new maplibregl.Popup({ offset: 20, closeButton: true, maxWidth: '320px' })
                .setHTML(`
          <div style="font-family:'Space Grotesk',sans-serif;padding:12px;background:#0f172a;color:#cbd5e1;border-radius:8px">
            <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
              <span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600">${typeInfo?.icon} ${typeInfo?.label || report.type}</span>
              <span style="background:#1e293b;color:#94a3b8;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;text-transform:capitalize">${report.congestionLevel}</span>
            </div>
            <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#e2e8f0">${report.description}</p>
            ${report.imageUrl ? `<img src="${report.imageUrl}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:8px" />` : ''}
            <div style="font-size:11px;color:#64748b;margin-bottom:8px">📍 ${report.locationName || 'Unknown location'}</div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:8px">
              <span>By ${report.isAnonymous ? 'Anonymous' : (report.username || 'Unknown')}</span>
              <span>${formatTimeAgo(report.createdAt)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="background:${report.status === 'active' ? '#22c55e20' : '#6b728020'};color:${report.status === 'active' ? '#22c55e' : '#94a3b8'};padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600">${report.status}</span>
              <span style="color:#64748b;font-size:11px">👍 ${report.upvotes || 0}</span>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}" target="_blank" style="margin-left:auto;color:#f97316;font-size:11px;text-decoration:none;font-weight:500">Directions →</a>
            </div>
          </div>
        `);

            markersRef.current[report.id] = new maplibregl.Marker({ element: el })
                .setLngLat([report.longitude, report.latitude])
                .setPopup(popup)
                .addTo(map.current);
        });
    }, [reports, mapLoaded]);

    // ── Heatmap ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!map.current || !mapLoaded) return;
        Object.values(markersRef.current).forEach((m) => {
            m.getElement().style.display = showHeatmap ? 'none' : '';
        });
        if (showHeatmap) {
            const data = buildHeatmapData(reports);
            if (map.current.getSource('heatmap-data')) {
                map.current.getSource('heatmap-data').setData(data);
            } else {
                map.current.addSource('heatmap-data', { type: 'geojson', data });
                map.current.addLayer({
                    id: 'heatmap-layer', type: 'heatmap', source: 'heatmap-data',
                    paint: {
                        'heatmap-weight': ['get', 'weight'],
                        'heatmap-intensity': 1.5,
                        'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
                            0, 'rgba(0,0,255,0)', 0.2, 'rgba(59,130,246,0.8)',
                            0.5, 'rgba(234,179,8,0.9)', 1, 'rgba(239,68,68,1)'],
                        'heatmap-radius': 30,
                        'heatmap-opacity': 0.8,
                    },
                });
            }
        } else {
            if (map.current.getLayer('heatmap-layer')) map.current.removeLayer('heatmap-layer');
        }
    }, [showHeatmap, reports, mapLoaded]);

    // ── No key fallback ───────────────────────────────────────────────────────
    if (!MAPTILER_KEY) {
        return (
            <div className="relative w-full h-full flex items-center justify-center bg-navy-950">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/20 via-navy-900 to-navy-950" />
                <div className="relative z-10 text-center p-8 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                        <MapPin className="text-brand-400" size={28} />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Map Integration Pending</h3>
                    <p className="text-navy-400 text-sm mb-4">Add your MapTiler key to enable the live map.</p>
                    <div className="card p-4 text-left text-xs font-mono space-y-1">
                        <p className="text-navy-300">Add to <span className="text-brand-400">frontend/.env</span>:</p>
                        <p className="text-brand-400">VITE_MAPTILER_KEY=your_key</p>
                    </div>
                </div>
                <div className="absolute bottom-6 left-6 glass py-2 px-4 rounded-xl text-sm text-navy-300">
                    📍 {reports.length} active incidents
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Heatmap toggle */}
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-lg ${showHeatmap ? 'bg-purple-600 text-white' : 'glass text-navy-300 hover:text-white'
                        }`}
                >
                    <Thermometer size={14} />
                    {showHeatmap ? 'Show Markers' : 'Heatmap View'}
                </button>
            </div>

            {/* Report count badge */}
            {mapLoaded && (
                <div className="absolute bottom-10 left-4 glass py-1.5 px-3 rounded-lg text-xs text-navy-300 z-10">
                    📍 {reports.filter(r => r.status === 'active').length} active incidents
                </div>
            )}
        </div>
    );
}
