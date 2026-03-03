import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../utils/validators.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Map } from 'lucide-react';
import { Input } from '../components/ui/Input.jsx';

function PasswordStrength({ password }) {
    const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
    const strength = checks.filter(Boolean).length;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    return password.length > 0 ? (
        <div className="space-y-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-navy-600'}`} />
                ))}
            </div>
            <p className={`text-xs ${strength >= 3 ? 'text-green-400' : 'text-yellow-400'}`}>{labels[strength]}</p>
        </div>
    ) : null;
}

export default function RegisterPage() {
    const { register: authRegister } = useAuth();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(registerSchema),
    });
    const password = watch('password', '');

    const onSubmit = async (data) => {
        setError('');
        try {
            await authRegister(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                        <Map size={18} className="text-white" />
                    </div>
                    <p className="font-bold text-white">OSTAS</p>
                </div>

                <h1 className="text-white text-2xl font-bold mb-1">Create account</h1>
                <p className="text-navy-400 text-sm mb-8">Join the community to report and stay informed</p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input id="username" label="Username" placeholder="rahul_m" error={errors.username?.message} {...register('username')} />
                    <Input id="email" label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-navy-300 text-sm font-medium">Password</label>
                        <div className="relative">
                            <input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input pr-11" {...register('password')} />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white">
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <PasswordStrength password={password} />
                        {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                    </div>

                    <Input id="confirmPassword" label="Confirm password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-6">
                        {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-navy-400 text-sm mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
