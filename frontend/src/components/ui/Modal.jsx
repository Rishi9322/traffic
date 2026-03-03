import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative glass-strong w-full max-w-lg shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between p-5 border-b border-navy-700/50">
                    <h2 className="text-white font-semibold">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-navy-400 hover:text-white hover:bg-navy-700">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}
