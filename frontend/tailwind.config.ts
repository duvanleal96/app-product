import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta minimalista
        'minimal-dark': '#1a1a1a',
        'minimal-gray': '#737373',
        'minimal-light': '#f5f5f5',
        'minimal-white': '#fafafa',
        'minimal-accent': '#10b981',
      },
      backgroundColor: {
        'minimal': '#ffffff',
        'minimal-soft': '#fafafa',
        'minimal-card': '#f9fafb',
      },
      borderColor: {
        'minimal': '#e5e5e5',
        'minimal-dark': '#d4d4d4',
      },
    },
  },
  plugins: [],
} satisfies Config
