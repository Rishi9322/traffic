import { INCIDENT_TYPES } from '../../utils/constants.js';
import { formatTimeAgo } from '../../utils/timeHelpers.js';

export default function AlertItem({ alert, onClick }) {
    const typeInfo = INCIDENT_TYPES.find((t) => t.value === alert.alertType);

    return (
        <div
            onClick={() => onClick?.(alert)}
            className={`flex items-start gap-3 p-3 border-b border-navy-700/30 last:border-0 transition-colors ${onClick ? 'hover:bg-navy-700/30 cursor-pointer' : ''}`}
        >
            <span className="text-xl flex-shrink-0 mt-0.5">{typeInfo?.icon || '⚠️'}</span>
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium leading-tight">{alert.message}</p>
                <p className="text-navy-400 text-xs mt-1">{formatTimeAgo(alert.createdAt)}</p>
            </div>
        </div>
    );
}
