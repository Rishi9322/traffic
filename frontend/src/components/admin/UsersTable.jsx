import { useState } from 'react';
import { ShieldCheck, Ban, FileText, Loader2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../hooks/useToast.js';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { formatDate } from '../../utils/timeHelpers.js';

export default function UsersTable({ users, loading, onRefresh }) {
    const toast = useToast();
    const [search, setSearch] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        return !q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });

    const doAction = async (action, id) => {
        try {
            if (action === 'ban') await adminApi.banUser(id);
            else if (action === 'promote') await adminApi.promoteUser(id);
            toast.success(`User ${action === 'ban' ? 'ban toggled' : 'promoted to admin'}`);
            onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="space-y-4">
            <input
                placeholder="Search by username or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input w-full md:w-72 text-sm"
            />

            <div className="glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-navy-700">
                            <tr>
                                {['Username', 'Email', 'Role', 'Reports', 'Status', 'Joined', 'Actions'].map((h) => (
                                    <th key={h} className="p-3 text-left text-navy-400 font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="animate-spin text-brand-400 mx-auto" /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-navy-400">No users found</td></tr>
                            ) : (
                                filtered.map((u) => (
                                    <tr key={u.id} className="border-b border-navy-700/50 hover:bg-navy-800/30">
                                        <td className="p-3 text-white font-medium">{u.username}</td>
                                        <td className="p-3 text-navy-400 text-xs">{u.email}</td>
                                        <td className="p-3">
                                            <span className={`badge ${u.role === 'admin' ? 'bg-brand-500/20 text-brand-400' : 'bg-navy-700 text-navy-300'}`}>{u.role}</span>
                                        </td>
                                        <td className="p-3 text-navy-400">{u.reportsCount || 0}</td>
                                        <td className="p-3">
                                            <span className={`badge ${u.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {u.isBanned ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-navy-400 text-xs">{formatDate(u.createdAt)}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setConfirmAction({ type: 'ban', id: u.id, label: u.isBanned ? 'Unban' : 'Ban' })}
                                                    className={`p-1.5 rounded ${u.isBanned ? 'text-green-400 hover:bg-green-400/10' : 'text-red-400 hover:bg-red-400/10'}`}
                                                    title={u.isBanned ? 'Unban' : 'Ban'}
                                                >
                                                    <Ban size={14} />
                                                </button>
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => setConfirmAction({ type: 'promote', id: u.id, label: 'Promote to Admin' })}
                                                        className="p-1.5 rounded text-brand-400 hover:bg-brand-400/10"
                                                        title="Promote to Admin"
                                                    >
                                                        <ShieldCheck size={14} />
                                                    </button>
                                                )}
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
                onConfirm={() => doAction(confirmAction?.type, confirmAction?.id)}
                title={`${confirmAction?.label}?`}
                message="Confirm this action on the selected user."
                confirmLabel={confirmAction?.label}
                danger={confirmAction?.type === 'ban'}
            />
        </div>
    );
}
