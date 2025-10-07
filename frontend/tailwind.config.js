export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dean Callan Brand - Royal Blue from logo
        'dc-blue': {
          50: '#eff4ff',
          100: '#dbe5ff',
          200: '#bfd3ff',
          300: '#93b4ff',
          400: '#6089ff',
          500: '#2f54ba', // Royal blue from Dean Callan logo - primary brand color
          600: '#1e3a8a',
          700: '#1a2f6b',
          800: '#16254f',
          900: '#0f1a3d',
        },
      },
    },
  },
  plugins: [],
}