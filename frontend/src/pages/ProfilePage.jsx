import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { authApi } from '../api/authApi.js';
import { useToast } from '../hooks/useToast.js';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ShieldCheck, FileText, LogOut, ArrowLeft, Clock, Edit2, KeyRound, Loader2, X, Check } from 'lucide-react';

export default function ProfilePage() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // ── Edit Info State ──
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [infoData, setInfoData] = useState({ username: user?.username || '', email: user?.email || '' });
    const [infoSaving, setInfoSaving] = useState(false);

    // ── Password State ──
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '' });
    const [pwdSaving, setPwdSaving] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSaveInfo = async (e) => {
        e.preventDefault();
        setInfoSaving(true);
        try {
            await authApi.updateMe(infoData);
            updateUser({ username: infoData.username, email: infoData.email });
            toast.success('Profile updated successfully');
            setIsEditingInfo(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setInfoSaving(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setPwdSaving(true);
        try {
            await authApi.changePassword(pwdData);
            toast.success('Password changed successfully');
            setIsEditingPassword(false);
            setPwdData({ currentPassword: '', newPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPwdSaving(false);
        }
    };

    const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';
    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    return (
        <div className="h-full overflow-y-auto w-full">
            <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-navy-400 hover:text-white text-sm transition-colors"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Avatar card */}
                <div className="glass p-6 flex flex-col md:flex-row md:items-center gap-5 justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-brand-500/20 border-2 border-brand-500/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-brand-400 text-2xl font-bold">{initials}</span>
                        </div>
                        <div>
                            <h1 className="text-white text-xl font-semibold">{user?.username}</h1>
                            <p className="text-navy-400 text-sm">{user?.email}</p>
                            <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold mt-1 ${user?.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                                }`}>
                                {user?.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center">
                            <FileText size={16} className="text-brand-400" />
                        </div>
                        <div>
                            <p className="text-navy-400 text-xs">Reports submitted</p>
                            <p className="text-white font-bold text-xl">{user?.reportsCount ?? 0}</p>
                        </div>
                    </div>
                    <div className="glass p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                            <Clock size={16} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-navy-400 text-xs">Member since</p>
                            <p className="text-white font-semibold text-sm">{joinedDate}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Info & Edit Form */}
                <div className="glass rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-navy-700/50 bg-navy-800/30">
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <User size={16} className="text-brand-400" /> Basic Info
                        </h2>
                        {!isEditingInfo ? (
                            <button onClick={() => { setIsEditingInfo(true); setInfoData({ username: user.username, email: user.email }); }} className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1">
                                <Edit2 size={14} /> Edit
                            </button>
                        ) : (
                            <button onClick={() => setIsEditingInfo(false)} className="text-navy-400 hover:text-white text-sm font-medium flex items-center gap-1">
                                <X size={14} /> Cancel
                            </button>
                        )}
                    </div>

                    {isEditingInfo ? (
                        <form onSubmit={handleSaveInfo} className="p-5 space-y-4">
                            <div>
                                <label className="text-navy-300 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Username</label>
                                <input
                                    type="text"
                                    value={infoData.username}
                                    onChange={(e) => setInfoData({ ...infoData, username: e.target.value })}
                                    className="input text-sm py-2"
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div>
                                <label className="text-navy-300 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Email</label>
                                <input
                                    type="email"
                                    value={infoData.email}
                                    onChange={(e) => setInfoData({ ...infoData, email: e.target.value })}
                                    className="input text-sm py-2"
                                    required
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button type="submit" disabled={infoSaving} className="btn-primary py-2 text-sm">
                                    {infoSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="divide-y divide-navy-700/50">
                            <div className="flex items-center gap-3 px-5 py-4">
                                <User size={16} className="text-navy-400" />
                                <div>
                                    <p className="text-navy-500 text-xs">Username</p>
                                    <p className="text-white text-sm font-medium">{user?.username}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-4">
                                <Mail size={16} className="text-navy-400" />
                                <div>
                                    <p className="text-navy-500 text-xs">Email</p>
                                    <p className="text-white text-sm font-medium">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Change Password */}
                <div className="glass rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-navy-700/50 bg-navy-800/30">
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <KeyRound size={16} className="text-purple-400" /> Security
                        </h2>
                        {!isEditingPassword ? (
                            <button onClick={() => setIsEditingPassword(true)} className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                                <Edit2 size={14} /> Change Password
                            </button>
                        ) : (
                            <button onClick={() => { setIsEditingPassword(false); setPwdData({ currentPassword: '', newPassword: '' }); }} className="text-navy-400 hover:text-white text-sm font-medium flex items-center gap-1">
                                <X size={14} /> Cancel
                            </button>
                        )}
                    </div>

                    {isEditingPassword && (
                        <form onSubmit={handleSavePassword} className="p-5 space-y-4">
                            <div>
                                <label className="text-navy-300 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Current Password</label>
                                <input
                                    type="password"
                                    value={pwdData.currentPassword}
                                    onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                                    className="input text-sm py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-navy-300 text-xs font-semibold uppercase tracking-wide mb-1.5 block">New Password</label>
                                <input
                                    type="password"
                                    value={pwdData.newPassword}
                                    onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                                    className="input text-sm py-2"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button type="submit" disabled={pwdSaving} className="btn-primary bg-purple-600 hover:bg-purple-500 py-2 text-sm shadow-purple-500/20">
                                    {pwdSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-sm font-medium transition-colors"
                        >
                            <ShieldCheck size={16} /> Go to Admin Panel
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
