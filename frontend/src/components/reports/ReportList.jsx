import { useReportStore } from '../../store/reportStore.js';
import ReportCard from './ReportCard.jsx';
import { Loader2 } from 'lucide-react';

export default function ReportList({ loading }) {
    const { reports } = useReportStore();
    const activeReports = reports.filter((r) => r.status === 'active');

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-navy-700/50">
                <h3 className="text-white font-semibold text-sm">Recent Reports</h3>
                <p className="text-navy-400 text-xs">{activeReports.length} active incident{activeReports.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-brand-400" />
                    </div>
                ) : activeReports.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-4xl mb-2">🎉</p>
                        <p className="text-navy-400 text-sm">No active incidents nearby!</p>
                    </div>
                ) : (
                    activeReports.map((r) => <ReportCard key={r.id} report={r} />)
                )}
            </div>
        </div>
    );
}
