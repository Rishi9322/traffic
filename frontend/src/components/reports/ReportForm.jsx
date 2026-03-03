import { useState, useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportSchema } from '../../utils/validators.js';
import { INCIDENT_TYPES, CONGESTION_LEVELS } from '../../utils/constants.js';
import { useReports } from '../../hooks/useReports.js';
import { useToast } from '../../hooks/useToast.js';
import { X, MapPin, Upload, Loader2, AlertTriangle, Navigation, Search } from 'lucide-react';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`
    : null;

export default function ReportForm({ onClose }) {
    const { createReport } = useReports();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [location, setLocation] = useState(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [searchQ, setSearchQ] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchTimer = useRef(null);
    const fileRef = useRef();

    // Map refs
    const mapContainer = useRef(null);
    const map = useRef(null);
    const pinMarker = useRef(null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(reportSchema),
        defaultValues: { type: 'accident', congestionLevel: 'medium', description: '' },
    });
    const description = watch('description', '');

    // ── Drop/update pin helper ────────────────────────────────────────────────
    const dropPin = (lng, lat, name) => {
        setLocation({ lat, lng, name: name || `${lat.toFixed(5)}°N, ${Math.abs(lng).toFixed(5)}°E` });
        if (pinMarker.current) {
            pinMarker.current.setLngLat([lng, lat]);
        } else {
            const el = document.createElement('div');
            el.style.cssText = [
                'width:28px', 'height:28px', 'background:#f97316',
                "border-radius:50% 50% 50% 0", 'transform:rotate(-45deg)',
                'border:3px solid white', 'box-shadow:0 4px 12px rgba(249,115,22,.6)',
            ].join(';');
            pinMarker.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
                .setLngLat([lng, lat])
                .addTo(map.current);
        }
    };

    // ── Mini-map init ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!MAP_STYLE || !mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: MAP_STYLE,
            center: [78.9629, 22.5937],
            zoom: 4,
            attributionControl: false,
            localIdeographFontFamily: ['sans-serif'],
        });

        map.current.once('load', () => {
            try {
                map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
            } catch (_) { }
        });

        map.current.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            dropPin(lng, lat);
        });

        return () => {
            if (map.current) { map.current.remove(); map.current = null; }
        };
    }, []);

    // ── Geocoding search ──────────────────────────────────────────────────────
    const handleSearchInput = (q) => {
        setSearchQ(q);
        clearTimeout(searchTimer.current);
        if (!q.trim() || q.length < 2) { setSearchResults([]); return; }
        searchTimer.current = setTimeout(async () => {
            setSearching(true);
            try {
                const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${MAPTILER_KEY}&country=in&limit=5&language=en`;
                const res = await fetch(url);
                const data = await res.json();
                setSearchResults(data.features || []);
            } catch (_) {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 350);
    };

    const selectPlace = (feature) => {
        const [lng, lat] = feature.center;
        const name = feature.place_name || feature.text || `${lat.toFixed(5)}°N ${Math.abs(lng).toFixed(5)}°E`;
        dropPin(lng, lat, name);
        setSearchQ('');
        setSearchResults([]);
        if (map.current) map.current.flyTo({ center: [lng, lat], zoom: 14, duration: 900 });
    };

    // ── GPS ───────────────────────────────────────────────────────────────────
    const handleGPS = () => {
        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude: lat, longitude: lng } }) => {
                setGpsLoading(false);
                dropPin(lng, lat, `${lat.toFixed(5)}°N, ${Math.abs(lng).toFixed(5)}°E`);
                if (map.current) map.current.flyTo({ center: [lng, lat], zoom: 14, duration: 1200 });
                toast.success('📍 GPS location set');
            },
            (err) => {
                setGpsLoading(false);
                if (err.code === err.PERMISSION_DENIED) {
                    toast.error('Location blocked. Click the 🔒 icon in your address bar → Allow location.');
                } else {
                    toast.error('Could not get GPS: ' + err.message);
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── Image ─────────────────────────────────────────────────────────────────
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const onSubmit = async (values) => {
        if (!location) { toast.error('Select a location first (search, click map, or use GPS)'); return; }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('type', values.type);
            fd.append('congestionLevel', values.congestionLevel);
            fd.append('description', values.description);
            fd.append('latitude', location.lat);
            fd.append('longitude', location.lng);
            fd.append('locationName', location.name);
            fd.append('isAnonymous', isAnonymous);
            if (imageFile) fd.append('image', imageFile);
            await createReport(fd);
            toast.success('🚨 Report submitted!');
            onClose?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    const clearPin = () => {
        setLocation(null);
        if (pinMarker.current) { pinMarker.current.remove(); pinMarker.current = null; }
    };

    return (
        // Use absolute inset-0 so we fill exactly the DashboardLayout main area
        <div className="absolute inset-0 flex">

            {/* ══ Left: clickable map ══════════════════════════════════════════ */}
            <div className="flex-1 relative overflow-hidden" style={{ minWidth: 0 }}>
                {MAP_STYLE ? (
                    <div ref={mapContainer} className="absolute inset-0" />
                ) : (
                    <div className="absolute inset-0 bg-navy-950 flex items-center justify-center">
                        <div className="text-center px-8">
                            <MapPin size={32} className="text-navy-600 mx-auto mb-3" />
                            <p className="text-navy-500 text-sm">Map unavailable</p>
                            <p className="text-navy-600 text-xs mt-1">VITE_MAPTILER_KEY not set</p>
                        </div>
                    </div>
                )}

                {/* Bottom hint overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white/70 whitespace-nowrap">
                        {location ? `📍 ${location.name.slice(0, 40)}` : '🖱️ Click anywhere on the map to drop a pin'}
                    </div>
                </div>
            </div>

            {/* ══ Right: form panel ════════════════════════════════════════════ */}
            <div
                className="flex flex-col bg-navy-800/95 border-l border-navy-700/60 shadow-2xl"
                style={{ width: '420px', flexShrink: 0 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-navy-700/50">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={17} className="text-brand-400" />
                        <h2 className="text-white font-semibold text-sm">Report New Incident</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-navy-400 hover:text-white hover:bg-navy-700">
                        <X size={17} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

                    {/* ── Location section ── */}
                    <div className="space-y-2">
                        <label className="text-navy-300 text-xs font-semibold uppercase tracking-wide">Location</label>

                        {/* Search input — ALWAYS visible */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQ}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder="Search city, street or landmark…"
                                className="w-full pl-9 pr-3 py-2.5 text-sm bg-navy-700/50 border border-navy-600 rounded-lg text-navy-100 placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
                            />
                            {searching && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 animate-spin" />}
                        </div>

                        {/* Dropdown results */}
                        {searchResults.length > 0 && (
                            <div className="border border-navy-700 rounded-lg overflow-hidden shadow-xl bg-navy-900">
                                {searchResults.map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => selectPlace(f)}
                                        className="w-full px-3 py-2 text-left text-sm text-navy-200 hover:bg-navy-700 flex items-start gap-2 border-b border-navy-800 last:border-0 transition-colors"
                                    >
                                        <MapPin size={13} className="text-brand-400 flex-shrink-0 mt-0.5" />
                                        <span className="leading-snug">{f.place_name || f.text}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected location display */}
                        {location ? (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                                <MapPin size={14} className="text-green-400 flex-shrink-0" />
                                <span className="text-green-400 text-xs font-mono flex-1 truncate">{location.name}</span>
                                <button type="button" onClick={clearPin} className="text-navy-500 hover:text-red-400 ml-1">
                                    <X size={13} />
                                </button>
                            </div>
                        ) : (
                            <p className="text-navy-500 text-xs text-center">← Search above, click the map, or use GPS</p>
                        )}

                        {/* GPS button */}
                        <button
                            type="button"
                            onClick={handleGPS}
                            disabled={gpsLoading}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-navy-600 text-navy-300 hover:border-brand-500 hover:text-brand-400 text-sm transition-colors disabled:opacity-50"
                        >
                            {gpsLoading
                                ? <><Loader2 size={14} className="animate-spin" /> Getting location…</>
                                : <><Navigation size={14} /> Use My GPS Location</>
                            }
                        </button>
                    </div>

                    {/* ── Incident Type ── */}
                    <div className="space-y-1.5">
                        <label className="text-navy-300 text-xs font-semibold uppercase tracking-wide">Incident Type</label>
                        <select {...register('type')} className="input text-sm">
                            {INCIDENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* ── Congestion Level ── */}
                    <div className="space-y-1.5">
                        <label className="text-navy-300 text-xs font-semibold uppercase tracking-wide">Congestion Level</label>
                        <div className="flex gap-2">
                            {CONGESTION_LEVELS.map((lvl) => (
                                <label key={lvl.value} className="flex-1 cursor-pointer">
                                    <input type="radio" {...register('congestionLevel')} value={lvl.value} className="sr-only" />
                                    <div className={`text-center py-2 rounded-lg border text-sm font-medium transition-all ${watch('congestionLevel') === lvl.value
                                        ? 'bg-brand-500 border-brand-500 text-white'
                                        : 'border-navy-600 text-navy-400 hover:border-navy-500'}`}>
                                        {lvl.label}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── Description ── */}
                    <div className="space-y-1.5">
                        <label className="text-navy-300 text-xs font-semibold uppercase tracking-wide">Description</label>
                        <div className="relative">
                            <textarea
                                {...register('description')}
                                rows={3}
                                placeholder="Describe the incident in detail…"
                                className="input resize-none text-sm"
                            />
                            <span className={`absolute bottom-2 right-3 text-[11px] ${description.length > 480 ? 'text-red-400' : 'text-navy-600'}`}>
                                {description.length}/500
                            </span>
                        </div>
                        {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
                    </div>

                    {/* ── Photo ── */}
                    <div className="space-y-1.5">
                        <label className="text-navy-300 text-xs font-semibold uppercase tracking-wide">Photo (optional)</label>
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="preview" className="w-full h-28 object-cover rounded-lg" />
                                <button
                                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="w-full border-2 border-dashed border-navy-600 rounded-lg p-4 text-center hover:border-brand-500/50 transition-colors"
                            >
                                <Upload size={20} className="text-navy-600 mx-auto mb-1" />
                                <p className="text-navy-500 text-xs">Click to upload · JPEG, PNG, WEBP · Max 5MB</p>
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                    </div>

                    {/* ── Anonymous toggle ── */}
                    <div className="flex items-center justify-between py-1">
                        <span className="text-navy-300 text-sm">Post anonymously</span>
                        <button
                            type="button"
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-brand-500' : 'bg-navy-600'}`}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isAnonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-navy-700/50">
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={submitting}
                        className="btn-primary w-full"
                    >
                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : '🚨 Submit Report'}
                    </button>
                    <p className="text-navy-600 text-xs text-center mt-2">Report expires automatically in 6 hours</p>
                </div>
            </div>
        </div>
    );
}
