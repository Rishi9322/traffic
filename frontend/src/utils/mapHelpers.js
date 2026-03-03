import { MARKER_COLORS, MARKER_SIZES } from './constants.js';

/**
 * Get hex color for a given incident type.
 */
export const getMarkerColor = (type) => MARKER_COLORS[type] || MARKER_COLORS.other;

/**
 * Get pixel size for a given congestion level.
 */
export const getMarkerSize = (level) => MARKER_SIZES[level] || MARKER_SIZES.medium;

/**
 * Build Mapbox heatmap data (GeoJSON FeatureCollection) from reports.
 * Weight each point by its upvote count.
 */
export function buildHeatmapData(reports) {
    return {
        type: 'FeatureCollection',
        features: reports.map((r) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
            properties: { weight: Math.max(1, r.upvotes || 1) },
        })),
    };
}

/**
 * Calculate great-circle distance in km between two lat/lng points.
 * Haversine formula.
 */
export function calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
