/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#E4EAF4',
        card: '#FFFFFF',
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          DEFAULT: '#6366F1',
        },
        slate: {
          850: '#151E2E',
        },
        coral: {
          DEFAULT: '#FF6B4A',
          dark: '#E05333',
        },
        amber: {
          accent: '#FBBF24',
        },
        emerald: {
          accent: '#10B981',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          hover: '#F8FAFC',
          border: '#E2E8F0',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          critical: '#EF4444',
          info: '#6366F1',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: ['Merriweather', 'Merriweather Sans', 'Georgia', 'serif'],
        heading: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 25px -2px rgba(100, 116, 139, 0.08), 0 2px 10px -2px rgba(100, 116, 139, 0.04)',
        soft: '0 10px 30px rgba(0, 0, 0, 0.04)',
        glowPurple: '0 0 20px rgba(99, 102, 241, 0.35)',
        glowOrange: '0 0 20px rgba(255, 107, 74, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
