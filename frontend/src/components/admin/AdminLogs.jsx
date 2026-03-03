import { formatDate } from '../../utils/timeHelpers.js';
import { Loader2 } from 'lucide-react';

const ACTION_COLORS = {
    DELETE_REPORT: 'text-red-400',
    FLAG_REPORT: 'text-yellow-400',
    RESOLVE_REPORT: 'text-green-400',
    BAN_USER: 'text-red-400',
    UNBAN_USER: 'text-green-400',
    PROMOTE_USER: 'text-brand-400',
    DELETE_USER: 'text-red-400',
};

export default function AdminLogs({ logs, loading }) {
    return (
        <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-navy-700">
                        <tr>
                            {['Admin', 'Action', 'Target', 'Details', 'Date & Time'].map((h) => (
                                <th key={h} className="p-3 text-left text-navy-400 font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin text-brand-400 mx-auto" /></td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-navy-400">No logs yet</td></tr>
                        ) : (
                            logs.map((l) => (
                                <tr key={l.id} className="border-b border-navy-700/50 hover:bg-navy-800/30">
                                    <td className="p-3 text-white text-xs">{l.adminUsername || 'Unknown'}</td>
                                    <td className="p-3"><span className={`text-xs font-semibold ${ACTION_COLORS[l.action] || 'text-navy-400'}`}>{l.action}</span></td>
                                    <td className="p-3 text-navy-400 text-xs font-mono truncate max-w-24">{l.targetId?.slice(0, 8) || '—'}</td>
                                    <td className="p-3 text-navy-400 text-xs truncate max-w-40">{l.details ? JSON.stringify(JSON.parse(l.details)) : '—'}</td>
                                    <td className="p-3 text-navy-400 text-xs">{formatDate(l.createdAt)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
