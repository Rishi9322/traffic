import { Map, Zap, Shield, Globe } from 'lucide-react';

const features = [
    { icon: Map, label: 'Live Map', desc: 'Real-time incident markers on an interactive Mapbox map with heatmap view.' },
    { icon: Zap, label: 'Instant Alerts', desc: 'Socket.io-powered push notifications when an incident is reported near you.' },
    { icon: Shield, label: 'Verified Data', desc: 'Reports expire automatically and can be upvoted or flagged for accuracy.' },
    { icon: Globe, label: 'India-wide', desc: 'Crowdsourced coverage across all major Indian metropolitan cities.' },
];

const tech = [
    { label: 'React 18 + Vite', desc: 'Blazing fast frontend with HMR' },
    { label: 'Node.js + Express', desc: 'RESTful API backend (ES Modules)' },
    { label: 'Socket.io v4', desc: 'Real-time bi-directional events' },
    { label: 'Turso (SQLite)', desc: 'Edge-native database via Drizzle ORM' },
    { label: 'Mapbox GL JS', desc: 'Interactive vector map tiles' },
    { label: 'ImageKit', desc: 'Cloud image storage & CDN' },
];

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-10">
            {/* Hero */}
            <div className="glass p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto shadow-xl shadow-brand-500/30">
                    <Map size={32} className="text-white" />
                </div>
                <h1 className="text-white text-3xl font-bold">Overcrowd Source Traffic Alert System</h1>
                <p className="text-navy-400 max-w-2xl mx-auto leading-relaxed">
                    OSTAS is a crowd-sourced, real-time traffic alerting platform built to help Indian commuters make smarter routing decisions.
                    Users report incidents, receive geo-targeted alerts, and help build a live picture of road conditions across India.
                </p>
            </div>

            {/* Features */}
            <div>
                <h2 className="text-white text-xl font-semibold mb-4">Core Features</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {features.map(({ icon: Icon, label, desc }) => (
                        <div key={label} className="glass p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                                <Icon size={18} className="text-brand-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">{label}</p>
                                <p className="text-navy-400 text-xs mt-1 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Technology */}
            <div>
                <h2 className="text-white text-xl font-semibold mb-4">Technology Stack</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tech.map(({ label, desc }) => (
                        <div key={label} className="glass p-4">
                            <p className="text-brand-400 font-medium text-sm">{label}</p>
                            <p className="text-navy-400 text-xs mt-1">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modules */}
            <div className="glass p-6 space-y-3">
                <h2 className="text-white text-xl font-semibold">SRS Modules</h2>
                <ul className="space-y-2">
                    {['User Registration & Authentication', 'Traffic Reporting', 'Traffic Alert & Notification', 'Map Visualization', 'Admin & Monitoring'].map((m, i) => (
                        <li key={m} className="flex items-center gap-3 text-navy-300 text-sm">
                            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                            {m}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
