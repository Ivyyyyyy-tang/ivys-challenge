import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#F5F0E8',
        ink: '#201A15',
        taupe: '#76695D',
        line: '#DED2C5',
        panel: 'rgba(255,255,255,0.72)',
      },
      fontFamily: {
        display: ['"Iowan Old Style"', '"Palatino Linotype"', 'serif'],
        body: ['"Avenir Next"', '"Helvetica Neue"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 48px rgba(32, 26, 21, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
