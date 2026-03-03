import { useState } from 'react';
import { Check, Eye, Loader2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../hooks/useToast.js';
import { Modal } from '../ui/Modal.jsx';
import { formatDate } from '../../utils/timeHelpers.js';

export default function FeedbackTable({ feedbacks, loading, onRefresh }) {
    const toast = useToast();
    const [viewItem, setViewItem] = useState(null);

    const markRead = async (id) => {
        await adminApi.markFeedbackRead(id).catch(() => { });
        onRefresh();
    };

    return (
        <div className="space-y-4">
            <div className="glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-navy-700">
                            <tr>
                                {['Name', 'Email', 'Message', 'Received', 'Read', 'Actions'].map((h) => (
                                    <th key={h} className="p-3 text-left text-navy-400 font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="animate-spin text-brand-400 mx-auto" /></td></tr>
                            ) : (feedbacks || []).length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-navy-400">No feedback yet</td></tr>
                            ) : (
                                (feedbacks || []).map((f) => (
                                    <tr key={f.id} className={`border-b border-navy-700/50 hover:bg-navy-800/30 ${!f.isRead ? 'bg-brand-500/5' : ''}`}>
                                        <td className="p-3 text-white text-xs font-medium">{f.name}</td>
                                        <td className="p-3 text-navy-400 text-xs">{f.email}</td>
                                        <td className="p-3 text-navy-300 text-xs max-w-48 truncate">{f.message}</td>
                                        <td className="p-3 text-navy-400 text-xs">{formatDate(f.createdAt)}</td>
                                        <td className="p-3">
                                            <span className={`badge text-xs ${f.isRead ? 'bg-navy-700 text-navy-400' : 'bg-brand-500/20 text-brand-400'}`}>
                                                {f.isRead ? 'Read' : 'New'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setViewItem(f)} className="p-1.5 rounded text-navy-400 hover:text-white hover:bg-navy-700" title="View"><Eye size={14} /></button>
                                                {!f.isRead && (
                                                    <button onClick={() => markRead(f.id)} className="p-1.5 rounded text-green-400 hover:bg-green-400/10" title="Mark read"><Check size={14} /></button>
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

            <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={`Message from ${viewItem?.name}`}>
                <p className="text-navy-400 text-xs mb-1">{viewItem?.email}</p>
                <p className="text-navy-300 text-sm leading-relaxed bg-navy-700/30 p-4 rounded-lg">{viewItem?.message}</p>
            </Modal>
        </div>
    );
}
