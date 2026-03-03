export function Button({ variant = 'primary', children, className = '', ...props }) {
    const variants = {
        primary: 'btn-primary',
        danger: 'btn-danger',
        ghost: 'btn-ghost',
        outline: 'btn-outline',
    };
    return (
        <button className={`${variants[variant] || variants.primary} ${className}`} {...props}>
            {children}
        </button>
    );
}
