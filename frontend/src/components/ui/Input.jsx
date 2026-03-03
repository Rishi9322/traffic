import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ label, error, id, className = '', ...props }, ref) {
    return (
        <div className="space-y-1">
            {label && <label htmlFor={id} className="text-navy-300 text-sm font-medium">{label}</label>}
            <input
                ref={ref}
                id={id}
                className={`input ${error ? 'border-red-500 focus:ring-red-500/50' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
    );
});
