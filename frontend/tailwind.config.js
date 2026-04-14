/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#edfcf4',
          100: '#d3f8e3',
          200: '#aaf0cc',
          300: '#72e3af',
          400: '#38ce8d',
          500: '#14b371',
          600: '#07925a',
          700: '#067449',
          800: '#085c3b',
          900: '#084c31',
          950: '#032b1c',
        },
        surface: {
          0:   '#0a0f0d',
          50:  '#0f1712',
          100: '#141f18',
          200: '#1a2820',
          300: '#203229',
          400: '#2a4035',
        },
        accent: {
          yellow: '#f5e642',
          blue:   '#42c5f5',
          red:    '#f54242',
        },
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up':   'slideUp 0.5s ease-out',
        'fade-in':    'fadeIn 0.4s ease-out',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        glow:    { from: { boxShadow: '0 0 5px #14b371, 0 0 10px #14b371' }, to: { boxShadow: '0 0 20px #14b371, 0 0 40px #14b371' } },
      },
    },
  },
  plugins: [],
}
