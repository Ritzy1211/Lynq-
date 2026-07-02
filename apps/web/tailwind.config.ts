import type { Config } from 'tailwindcss';

/**
 * Merged config:
 *  - `brand.*` colors continue to power the Lynq staff / admin dashboards.
 *  - Everything else (background/foreground/accent/secondary, display font,
 *    keyframes, glass utilities) powers the TotalCare marketing site.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0ea5b7',
          dark: '#0a7d8a',
          light: '#5dd6e3',
        },
        background: '#FAFAFA',
        foreground: '#111827',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        primary: {
          DEFAULT: '#111827',
          foreground: '#FAFAFA',
        },
        accent: {
          DEFAULT: '#10B981',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#06B6D4',
          foreground: '#FFFFFF',
        },
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#10B981',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(17,24,39,0.04), 0 1px 1px rgba(17,24,39,0.02)',
        soft: '0 6px 24px -8px rgba(17,24,39,0.10), 0 2px 6px -2px rgba(17,24,39,0.04)',
        lift: '0 24px 60px -20px rgba(17,24,39,0.18), 0 8px 24px -12px rgba(17,24,39,0.08)',
        glow: '0 20px 60px -20px rgba(16,185,129,0.45)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(to right, rgba(17,24,39,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.05) 1px, transparent 1px)',
        'radial-fade':
          'radial-gradient(circle at center, rgba(16,185,129,0.15), transparent 60%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
