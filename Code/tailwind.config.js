/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        foreground: '#FFFFFF',
        card: {
          DEFAULT: '#121212',
          foreground: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#CCFF00',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#27272A',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#18181B',
          foreground: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#CCFF00',
          foreground: '#000000',
        },
        destructive: {
          DEFAULT: '#FF3B30',
          foreground: '#FFFFFF',
        },
        border: '#27272A',
        input: '#27272A',
        ring: '#CCFF00',
      },
      fontFamily: {
        barlow: ['Barlow Condensed', 'Oswald', 'sans-serif'],
        inter: ['Inter', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.125rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(204, 255, 0, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(204, 255, 0, 0.4)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
