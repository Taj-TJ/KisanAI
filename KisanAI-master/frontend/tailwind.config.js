/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
      },
      colors: {
        soil: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f4dba9',
          300: '#ecc070',
          400: '#e3a140',
          500: '#d4822a',
          600: '#b96520',
          700: '#9a4d1e',
          800: '#7d3e1f',
          900: '#68341c',
        },
        leaf: {
          50:  '#f1f8f0',
          100: '#dceedb',
          200: '#baddb8',
          300: '#8ec48b',
          400: '#61a65d',
          500: '#3f8a3b',
          600: '#2d6e2a',
          700: '#245723',
          800: '#1e451e',
          900: '#19391a',
        },
        sky: {
          fresh: '#e8f4fd',
          mid:   '#7eb8e0',
          deep:  '#2d6fa3',
        }
      },
      animation: {
        'slide-up':   'slideUp 0.4s ease-out',
        'fade-in':    'fadeIn 0.3s ease-out',
        'pulse-dot':  'pulseDot 1.4s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' },
          '40%':            { transform: 'scale(1)', opacity: '1'   },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
      }
    }
  },
  plugins: [],
}
