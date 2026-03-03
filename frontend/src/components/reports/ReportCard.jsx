import { INCIDENT_TYPES, STATUS_COLORS } from '../../utils/constants.js';
import { formatTimeAgo } from '../../utils/timeHelpers.js';
import { ThumbsUp, MapPin, Clock } from 'lucide-react';

export default function ReportCard({ report }) {
    const typeInfo = INCIDENT_TYPES.find((t) => t.value === report.type);
    const statusStyle = STATUS_COLORS[report.status] || STATUS_COLORS.active;

    return (
        <div className="glass p-4 hover:border-brand-500/30 transition-all animate-fade-in cursor-pointer group">
            <div className="flex items-start gap-3">
                <div className="text-2xl">{typeInfo?.icon || '⚠️'}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-white text-sm font-semibold">{typeInfo?.label || report.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            {report.status}
                        </span>
                    </div>
                    <p className="text-navy-400 text-xs line-clamp-2 mb-2">{report.description}</p>
                    <div className="flex items-center gap-3 text-navy-500 text-xs">
                        <span className="flex items-center gap-1"><MapPin size={10} />{report.locationName || 'Unknown'}</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{formatTimeAgo(report.createdAt)}</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={10} />{report.upvotes || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
