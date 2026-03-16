/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Updated to the Deep Navy & Orange theme from your image
        brand: {
          50: '#f8fafc',  // Text Primary (Off-white)
          100: '#94a3b8', // Text Secondary (Muted Slate)
          200: '#1e293b', // Glass/Button Background (Slate-800)
          500: '#f97316', // Primary Orange (Bangalore tag/Sale)
          600: '#ea580c', // Darker Orange (Hover states)
          900: '#0f172a', // Card Background (Deep Blue-Gray)
          950: '#020617', // App Main Background (Midnight)
        },
        // Added the Blue accent for the glow effects seen in your image
        accent: {
          blue: '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};