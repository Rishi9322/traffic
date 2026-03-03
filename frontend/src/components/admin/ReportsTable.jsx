import { useState } from 'react';
import { Trash2, Eye, CheckCircle, Flag, Loader2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../hooks/useToast.js';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { Badge } from '../ui/Badge.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatDate } from '../../utils/timeHelpers.js';
import { INCIDENT_TYPES, CONGESTION_LEVELS } from '../../utils/constants.js';

export default function ReportsTable({ reports, loading, onRefresh }) {
    const toast = useToast();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [selected, setSelected] = useState([]);
    const [confirmAction, setConfirmAction] = useState(null);
    const debouncedSearch = useDebounce(search);

    const filtered = reports.filter((r) => {
        if (statusFilter && r.status !== statusFilter) return false;
        if (typeFilter && r.type !== typeFilter) return false;
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            return r.description?.toLowerCase().includes(q) || r.locationName?.toLowerCase().includes(q);
        }
        return true;
    });

    const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    const selectAll = () => setSelected(filtered.map((r) => r.id));
    const clearSelect = () => setSelected([]);

    const doAction = async (action, id) => {
        try {
            if (action === 'delete') await adminApi.deleteReport(id);
            else if (action === 'resolve') await adminApi.resolveReport(id);
            else if (action === 'flag') await adminApi.flagReport(id);
            toast.success(`Report ${action}d`);
            onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const bulkDelete = async () => {
        for (const id of selected) await adminApi.deleteReport(id).catch(() => { });
        toast.success(`${selected.length} report(s) deleted`);
        setSelected([]);
        onRefresh();
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <input
                    placeholder="Search description or location…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input flex-1 min-w-48 text-sm"
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-36 text-sm">
                    <option value="">All Status</option>
                    {['active', 'resolved', 'expired', 'flagged'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-44 text-sm">
                    <option value="">All Types</option>
                    {INCIDENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {selected.length > 0 && (
                    <button onClick={() => setConfirmAction({ type: 'bulkDelete' })} className="btn-danger text-sm flex items-center gap-1">
                        <Trash2 size={14} /> Delete {selected.length} selected
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-navy-700">
                            <tr>
                                <th className="p-3 text-left"><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : clearSelect()} /></th>
                                <th className="p-3 text-left text-navy-400 font-medium">Date</th>
                                <th className="p-3 text-left text-navy-400 font-medium">Type</th>
                                <th className="p-3 text-left text-navy-400 font-medium hidden lg:table-cell">Location</th>
                                <th className="p-3 text-left text-navy-400 font-medium">Status</th>
                                <th className="p-3 text-left text-navy-400 font-medium hidden md:table-cell">Upvotes</th>
                                <th className="p-3 text-left text-navy-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="animate-spin text-brand-400 mx-auto" /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-navy-400">No reports found</td></tr>
                            ) : (
                                filtered.map((r) => (
                                    <tr key={r.id} className="border-b border-navy-700/50 hover:bg-navy-800/30">
                                        <td className="p-3"><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                                        <td className="p-3 text-navy-300 text-xs">{formatDate(r.createdAt)}</td>
                                        <td className="p-3"><Badge type={r.type} variant="type" /></td>
                                        <td className="p-3 text-navy-300 text-xs hidden lg:table-cell max-w-32 truncate">{r.locationName || '—'}</td>
                                        <td className="p-3"><Badge type={r.status} variant="status" /></td>
                                        <td className="p-3 text-navy-400 hidden md:table-cell">👍 {r.upvotes}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => doAction('resolve', r.id)} className="p-1.5 rounded text-green-400 hover:bg-green-400/10" title="Resolve"><CheckCircle size={14} /></button>
                                                <button onClick={() => doAction('flag', r.id)} className="p-1.5 rounded text-yellow-400 hover:bg-yellow-400/10" title="Flag"><Flag size={14} /></button>
                                                <button onClick={() => setConfirmAction({ type: 'delete', id: r.id })} className="p-1.5 rounded text-red-400 hover:bg-red-400/10" title="Delete"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => {
                    if (confirmAction?.type === 'bulkDelete') bulkDelete();
                    else doAction('delete', confirmAction?.id);
                }}
                title={confirmAction?.type === 'bulkDelete' ? `Delete ${selected.length} reports?` : 'Delete report?'}
                message="This action cannot be undone."
                confirmLabel="Delete"
                danger
            />
        </div>
    );
}
