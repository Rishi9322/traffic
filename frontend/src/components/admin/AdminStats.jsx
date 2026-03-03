import { FileText, Activity, CheckCircle, Users } from 'lucide-react';

const ICONS = {
    total: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    active: { icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
    resolved: { icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    users: { icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
};

function StatCard({ label, value, type }) {
    const cfg = ICONS[type];
    const Icon = cfg.icon;
    return (
        <div className="stat-card">
            <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={cfg.color} />
            </div>
            <div>
                <p className="text-navy-400 text-xs">{label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${cfg.color}`}>{value?.toLocaleString() ?? '—'}</p>
            </div>
        </div>
    );
}

export default function AdminStats({ stats }) {
    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Reports" value={stats?.totalReports} type="total" />
            <StatCard label="Active Reports" value={stats?.activeReports} type="active" />
            <StatCard label="Resolved Today" value={stats?.resolvedToday} type="resolved" />
            <StatCard label="Active Users (24h)" value={stats?.activeUsers24h} type="users" />
        </div>
    );
}
