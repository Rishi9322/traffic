/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // OSTAS brand palette
                brand: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316', // primary orange
                    600: '#ea6a0e',
                    700: '#c2550b',
                    800: '#9a4409',
                    900: '#7c3707',
                },
                navy: {
                    900: '#0f172a',
                    800: '#1e293b',
                    700: '#334155',
                    600: '#475569',
                    500: '#64748b',
                    400: '#94a3b8',
                    300: '#cbd5e1',
                    200: '#e2e8f0',
                    100: '#f1f5f9',
                },
            },
            fontFamily: {
                sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'bounce-soft': 'bounceSoft 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    from: { opacity: '0', transform: 'translateX(100%)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                bounceSoft: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};
