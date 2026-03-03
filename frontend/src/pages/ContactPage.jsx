import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { feedbackSchema } from '../utils/validators.js';
import { feedbackApi } from '../api/feedbackApi.js';
import { useToast } from '../hooks/useToast.js';
import { Input } from '../components/ui/Input.jsx';
import { Loader2, Send, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
    const toast = useToast();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(feedbackSchema),
        defaultValues: { name: '', email: '', message: '' },
    });

    const onSubmit = async (data) => {
        try {
            await feedbackApi.submitFeedback(data);
            toast.success('Message sent! We\'ll get back to you soon.');
            reset();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send message');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-white text-2xl font-bold">Contact Us</h1>
                <p className="text-navy-400 mt-1">Have feedback, found a bug, or want to suggest a feature? We'd love to hear from you.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="glass p-6 space-y-4">
                    <h2 className="text-white font-semibold">Send a Message</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input id="name" label="Full Name" placeholder="Rahul Mehta" error={errors.name?.message} {...register('name')} />
                        <Input id="email" label="Email Address" type="email" placeholder="rahul@example.com" error={errors.email?.message} {...register('email')} />
                        <div className="space-y-1">
                            <label className="text-navy-300 text-sm font-medium">Message</label>
                            <textarea {...register('message')} rows={5} placeholder="Your message…" className={`input resize-none ${errors.message ? 'border-red-500' : ''}`} />
                            {errors.message && <p className="text-red-400 text-xs">{errors.message.message}</p>}
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={16} /> Send Message</>}
                        </button>
                    </form>
                </div>

                {/* Contact info */}
                <div className="space-y-4">
                    {[
                        { icon: Mail, title: 'Email Us', text: 'support@ostas.in', sub: 'We usually reply within 24 hours' },
                        { icon: MapPin, title: 'Coverage Area', text: 'India-wide', sub: 'Mumbai, Delhi, Bangalore, Chennai, Hyderabad + more' },
                        { icon: Clock, title: 'Response Time', text: 'Within 24 hours', sub: 'Monday–Friday, 9AM to 6PM IST' },
                    ].map(({ icon: Icon, title, text, sub }) => (
                        <div key={title} className="glass p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                                <Icon size={18} className="text-brand-400" />
                            </div>
                            <div>
                                <p className="text-navy-400 text-xs mb-0.5">{title}</p>
                                <p className="text-white font-medium text-sm">{text}</p>
                                <p className="text-navy-500 text-xs mt-0.5">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
