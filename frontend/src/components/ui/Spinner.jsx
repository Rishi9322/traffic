export function Spinner({ size = 'md', className = '' }) {
    const sizeClass = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size] || 'w-6 h-6';
    return (
        <div className={`${sizeClass} border-2 border-navy-600 border-t-brand-500 rounded-full animate-spin ${className}`} />
    );
}
