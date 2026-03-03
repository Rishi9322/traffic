import { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi.js';
import AdminStats from '../components/admin/AdminStats.jsx';
import AdminCharts from '../components/admin/AdminCharts.jsx';
import ReportsTable from '../components/admin/ReportsTable.jsx';
import UsersTable from '../components/admin/UsersTable.jsx';
import AdminLogs from '../components/admin/AdminLogs.jsx';
import FeedbackTable from '../components/admin/FeedbackTable.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { BarChart2, FileText, Users, Terminal, MessageSquare } from 'lucide-react';

const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
];

export default function AdminPage() {
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === 'overview') {
                const { data } = await adminApi.getStats();
                setStats(data.data);
            } else if (tab === 'reports') {
                const { data } = await adminApi.getReports({ limit: 100 });
                setReports(data.data);
            } else if (tab === 'users') {
                const { data } = await adminApi.getUsers({ limit: 100 });
                setUsers(data.data);
            } else if (tab === 'logs') {
                const { data } = await adminApi.getLogs({ limit: 100 });
                setLogs(data.data);
            } else if (tab === 'feedback') {
                const { data } = await adminApi.getFeedback();
                setFeedbacks(data.data);
            }
        } catch (_) { } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [tab]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === id
                                ? 'bg-brand-500 text-white'
                                : 'glass text-navy-400 hover:text-white'
                            }`}
                    >
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {loading && tab === 'overview' ? (
                <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
            ) : (
                <>
                    {tab === 'overview' && (
                        <div className="space-y-6">
                            <AdminStats stats={stats} />
                            <AdminCharts stats={stats} />
                        </div>
                    )}
                    {tab === 'reports' && <ReportsTable reports={reports} loading={loading} onRefresh={loadData} />}
                    {tab === 'users' && <UsersTable users={users} loading={loading} onRefresh={loadData} />}
                    {tab === 'logs' && <AdminLogs logs={logs} loading={loading} />}
                    {tab === 'feedback' && <FeedbackTable feedbacks={feedbacks} loading={loading} onRefresh={loadData} />}
                </>
            )}
        </div>
    );
}
