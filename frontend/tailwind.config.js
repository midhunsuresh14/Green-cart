module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2e7d32',
          dark: '#1b5e20',
          light: '#4caf50',
        },
      },
    },
  },
  plugins: [],
};
