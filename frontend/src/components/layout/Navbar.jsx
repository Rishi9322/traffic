import { Bell, Menu, User, LogOut, Shield } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertItem from '../alerts/AlertItem.jsx';

export default function Navbar({ title, onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { coords } = useGeolocation();
    const { alerts, unreadCount, markAllRead } = useAlerts(coords);
    const [bellOpen, setBellOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Close profile dropdown on outside click
    useEffect(() => {
        function handler(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleBellClick = () => {
        setProfileOpen(false);
        setBellOpen(!bellOpen);
        if (!bellOpen) markAllRead();
    };

    const handleLogout = async () => {
        setProfileOpen(false);
        await logout();
        navigate('/login');
    };

    return (
        <header className="h-16 flex items-center px-4 gap-4 bg-navy-900 border-b border-navy-700/50 relative z-30">
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800"
            >
                <Menu size={20} />
            </button>

            <h1 className="text-white font-semibold text-lg flex-1">{title}</h1>

            {/* Notification Bell */}
            <div className="relative">
                <button
                    onClick={handleBellClick}
                    className="relative p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {bellOpen && (
                    <div className="absolute right-0 top-12 w-80 glass-strong border border-navy-700/60 shadow-2xl rounded-xl overflow-hidden z-50">
                        <div className="flex items-center justify-between p-3 border-b border-navy-700/50">
                            <span className="text-white font-semibold text-sm">Recent Alerts</span>
                            <button onClick={markAllRead} className="text-brand-400 text-xs hover:text-brand-300">Mark all read</button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {alerts.length === 0 ? (
                                <p className="text-navy-400 text-sm text-center py-6">No alerts nearby</p>
                            ) : (
                                alerts.map((a) => (
                                    <AlertItem
                                        key={a.id}
                                        alert={a}
                                        onClick={(alert) => {
                                            setBellOpen(false);
                                            navigate('/dashboard', {
                                                state: { focusLocation: { lat: alert.latitude, lng: alert.longitude } }
                                            });
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Profile avatar + dropdown */}
            <div className="relative" ref={profileRef}>
                <button
                    onClick={() => { setBellOpen(false); setProfileOpen(!profileOpen); }}
                    className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center hover:bg-brand-500/30 transition-colors"
                    title="Profile"
                >
                    <span className="text-brand-400 text-sm font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                </button>

                {profileOpen && (
                    <div className="absolute right-0 top-11 w-60 glass-strong border border-navy-700/60 shadow-2xl rounded-xl overflow-hidden z-50">
                        {/* Profile header */}
                        <div className="p-4 border-b border-navy-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center flex-shrink-0">
                                    <span className="text-brand-400 font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-white font-semibold text-sm truncate">{user?.username}</p>
                                    <p className="text-navy-400 text-xs truncate">{user?.email}</p>
                                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold mt-0.5 ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-brand-500/20 text-brand-400'}`}>
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5 space-y-0.5">
                            <div className="px-3 py-2 rounded-lg">
                                <p className="text-navy-400 text-xs">Reports submitted</p>
                                <p className="text-white font-semibold text-sm">{user?.reportsCount ?? 0}</p>
                            </div>

                            <button
                                onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-navy-300 hover:bg-navy-700 text-sm transition-colors"
                            >
                                <User size={15} />
                                View Profile
                            </button>

                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => { setProfileOpen(false); navigate('/admin'); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-purple-400 hover:bg-purple-500/10 text-sm transition-colors"
                                >
                                    <Shield size={15} />
                                    Admin Panel
                                </button>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                            >
                                <LogOut size={15} />
                                Sign out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
