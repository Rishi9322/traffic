import {
    AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const TYPE_COLORS = {
    accident: '#EF4444',
    congestion: '#F97316',
    roadblock: '#EAB308',
    waterlogging: '#3B82F6',
    other: '#6B7280',
};

export default function AdminCharts({ stats }) {
    const areaData = stats?.reportsLast7Days || [];
    const pieData = (stats?.reportsByType || []).map((r) => ({
        name: r.type, value: r.count, fill: TYPE_COLORS[r.type] || '#6B7280',
    }));

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Area Chart */}
            <div className="glass p-5">
                <h3 className="text-white font-semibold text-sm mb-4">Reports Last 7 Days</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={areaData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        {Object.entries(TYPE_COLORS).map(([key, color]) => (
                            <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color + '22'} strokeWidth={2} />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="glass p-5">
                <h3 className="text-white font-semibold text-sm mb-4">Report Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#475569' }}>
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
