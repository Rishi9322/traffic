import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import {
    Map, AlertTriangle, Info, HelpCircle, Mail, ShieldCheck, LogOut, Sun, Moon, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { to: '/dashboard', icon: Map, label: 'Live Map' },
    { to: '/report', icon: AlertTriangle, label: 'Report Incident' },
    { to: '/about', icon: Info, label: 'About' },
    { to: '/help', icon: HelpCircle, label: 'Help' },
    { to: '/contact', icon: Mail, label: 'Contact Us' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('ostas-theme');
        if (saved === 'light') {
            document.documentElement.classList.add('light');
            return false;
        }
        return true;
    });

    const toggleDark = () => {
        const next = !darkMode;
        document.documentElement.classList.toggle('light', !next);
        localStorage.setItem('ostas-theme', next ? 'dark' : 'light');
        setDarkMode(next);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside
            className={`h-full flex flex-col bg-navy-900 border-r border-navy-700/50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 p-4 border-b border-navy-700/50 h-16">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30">
                    <Map size={18} className="text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="font-bold text-white text-sm leading-none">OSTAS</p>
                        <p className="text-navy-400 text-xs mt-0.5">Traffic Alerts</p>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto text-navy-400 hover:text-white transition-colors"
                >
                    <ChevronRight size={16} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${isActive
                                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                                : 'text-navy-400 hover:text-white hover:bg-navy-800'
                            }`
                        }
                    >
                        <Icon size={18} className="flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">{label}</span>}
                    </NavLink>
                ))}

                {user?.role === 'admin' && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${isActive
                                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                                : 'text-navy-400 hover:text-white hover:bg-navy-800'
                            }`
                        }
                    >
                        <ShieldCheck size={18} className="flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">Admin Panel</span>}
                    </NavLink>
                )}
            </nav>

            {/* Bottom actions */}
            <div className="p-2 border-t border-navy-700/50 space-y-1">
                <button
                    onClick={toggleDark}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    {!collapsed && <span className="text-sm font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {/* User info — click to go to profile */}
                <button
                    onClick={() => navigate('/profile')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left hover:bg-navy-700 transition-colors ${!collapsed ? 'bg-navy-800/50' : ''}`}
                >
                    <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-400 text-xs font-bold">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden flex-1">
                            <p className="text-white text-xs font-semibold truncate">{user?.username}</p>
                            <p className="text-navy-400 text-xs capitalize">{user?.role}</p>
                        </div>
                    )}
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div >
        </aside >
    );
}
