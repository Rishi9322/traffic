import { STATUS_COLORS, INCIDENT_TYPES } from '../../utils/constants.js';

export function Badge({ type, variant = 'status' }) {
    if (variant === 'status') {
        const s = STATUS_COLORS[type] || STATUS_COLORS.active;
        return (
            <span className={`badge ${s.bg} ${s.text} border ${s.border}`}>{type}</span>
        );
    }
    if (variant === 'type') {
        const t = INCIDENT_TYPES.find((i) => i.value === type);
        return (
            <span className="badge bg-navy-700 text-navy-200">{t?.icon} {t?.label || type}</span>
        );
    }
    return <span className="badge bg-navy-700 text-navy-300">{type}</span>;
}
