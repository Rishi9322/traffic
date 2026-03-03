import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../utils/validators.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Map } from 'lucide-react';
import { Input } from '../components/ui/Input.jsx';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setError('');
        try {
            await login(data.email, data.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-navy-900 bg-grid flex">
            {/* Left Panel */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-navy-900 to-navy-800 border-r border-navy-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                        <Map size={22} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-lg leading-none">OSTAS</p>
                        <p className="text-navy-400 text-xs">Traffic Alert System</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Decorative map visual */}
                    <div className="w-full h-64 rounded-2xl bg-navy-700/50 border border-navy-600/40 overflow-hidden relative flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-8 left-12 w-20 h-20 rounded-full border-2 border-brand-500 animate-pulse-slow" />
                            <div className="absolute top-16 left-16 w-36 h-36 rounded-full border border-brand-500/50" />
                            <div className="absolute bottom-8 right-12 w-16 h-16 rounded-full border-2 border-blue-500 animate-pulse-slow" />
                        </div>
                        <div className="text-center z-10">
                            <div className="text-6xl mb-3">🗺️</div>
                            <p className="text-navy-400 text-sm">Live Traffic Map</p>
                        </div>
                        {/* Incident dots */}
                        <div className="absolute top-6 left-20 w-3 h-3 bg-red-500 rounded-full animate-bounce-soft" />
                        <div className="absolute bottom-12 left-1/3 w-3 h-3 bg-orange-500 rounded-full animate-bounce-soft" style={{ animationDelay: '0.2s' }} />
                        <div className="absolute top-1/2 right-16 w-3 h-3 bg-blue-500 rounded-full animate-bounce-soft" style={{ animationDelay: '0.4s' }} />
                    </div>

                    <div>
                        <h2 className="text-white text-3xl font-bold leading-tight mb-3">
                            Real-time crowd-sourced<br />
                            <span className="text-brand-400">traffic alerts.</span>
                        </h2>
                        <p className="text-navy-400 leading-relaxed">
                            Drive smarter, not harder. Report incidents, get notified about congestion, and plan alternate routes in real-time.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[['🚨', 'Accidents'], ['🚦', 'Congestion'], ['🚧', 'Roadblocks']].map(([icon, label]) => (
                            <div key={label} className="glass p-3 text-center">
                                <div className="text-2xl mb-1">{icon}</div>
                                <p className="text-navy-400 text-xs">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-navy-600 text-xs">© 2026 OSTAS · Powered by Mumbai, Delhi, Bangalore, Chennai, Hyderabad</p>
            </div>

            {/* Right Panel — Login Form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                            <Map size={18} className="text-white" />
                        </div>
                        <p className="font-bold text-white">OSTAS</p>
                    </div>

                    <h1 className="text-white text-2xl font-bold mb-1">Welcome back</h1>
                    <p className="text-navy-400 text-sm mb-8">Sign in to your account to continue</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            id="email"
                            label="Email address"
                            type="email"
                            placeholder="you@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <div className="space-y-1">
                            <label htmlFor="password" className="text-navy-300 text-sm font-medium">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={`input pr-11 ${errors.password ? 'border-red-500' : ''}`}
                                    {...register('password')}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-6">
                            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-navy-700" />
                        <span className="text-navy-500 text-xs">or</span>
                        <div className="flex-1 h-px bg-navy-700" />
                    </div>

                    <p className="text-center text-navy-400 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Create account</Link>
                    </p>

                    {/* Demo credentials */}
                    <div className="mt-6 p-3 rounded-lg bg-navy-800/50 border border-navy-700/50 text-xs text-navy-400">
                        <p className="font-medium text-navy-300 mb-1">Demo Credentials</p>
                        <p>Admin: <span className="text-white">admin@ostas.com</span> / <span className="text-white">Admin@1234</span></p>
                        <p>User: <span className="text-white">rahul@test.com</span> / <span className="text-white">Test@1234</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
