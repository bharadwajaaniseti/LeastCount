/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'felt-green': {
          400: '#2d5a3d',
          500: '#1e3a2e',
          600: '#163027',
        },
        'wood': {
          400: '#8b4513',
          500: '#654321',
          600: '#4a2c17',
        },
      },
      fontFamily: {
        'card': ['Georgia', 'serif'],
      },
      animation: {
        'card-move': 'cardMove 0.5s ease-in-out',
        'card-flip': 'cardFlip 0.3s ease-in-out',
        'timer-spin': 'spin 30s linear infinite',
      },
      keyframes: {
        cardMove: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'table': 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
        'wood-rim': '0 0 15px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
};
