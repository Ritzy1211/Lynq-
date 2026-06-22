import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0ea5b7',
          dark: '#0a7d8a',
          light: '#5dd6e3',
        },
      },
    },
  },
  plugins: [],
};

export default config;
