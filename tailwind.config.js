export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0a0b10',
          800: '#11131a',
          700: '#1a1d28',
          600: '#23283a',
          500: '#2f354a'
        },
        neon: {
          400: '#67e8f9',
          500: '#22d3ee'
        },
        magenta: {
          500: '#fb7185'
        },
        sunset: {
          400: '#fb923c',
          500: '#f97316'
        }
      },
      boxShadow: {
        glow: '0 0 34px rgba(34, 211, 238, 0.18)'
      }
    }
  },
  plugins: []
};
