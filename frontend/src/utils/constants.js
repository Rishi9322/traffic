export const INCIDENT_TYPES = [
    { value: 'accident', label: 'Accident', icon: '🚨' },
    { value: 'congestion', label: 'Traffic Congestion', icon: '🚦' },
    { value: 'roadblock', label: 'Roadblock', icon: '🚧' },
    { value: 'waterlogging', label: 'Waterlogging', icon: '💧' },
    { value: 'other', label: 'Other', icon: '⚠️' },
];

export const CONGESTION_LEVELS = [
    { value: 'light', label: 'Light', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'heavy', label: 'Heavy', color: 'text-red-400' },
];

export const MARKER_COLORS = {
    accident: '#EF4444', // red
    congestion: '#F97316', // orange
    roadblock: '#EAB308', // yellow
    waterlogging: '#3B82F6', // blue
    other: '#6B7280', // gray
};

export const MARKER_SIZES = {
    light: 24,
    medium: 32,
    heavy: 40,
};

export const STATUS_COLORS = {
    active: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    resolved: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
    expired: { bg: 'bg-navy-600/20', text: 'text-navy-400', border: 'border-navy-500/30' },
    flagged: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

export const SOCKET_EVENTS = {
    NEW_REPORT: 'newReport',
    REPORT_RESOLVED: 'reportResolved',
    REPORT_EXPIRED: 'reportExpired',
    REPORT_DELETED: 'reportDeleted',
    VOTE_UPDATE: 'voteUpdate',
};

export const MAP_STYLES = {
    dark: 'mapbox://styles/mapbox/dark-v11',
    light: 'mapbox://styles/mapbox/streets-v12',
};
