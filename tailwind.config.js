/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#075E54',
          primary: '#128C7E',
          accent: '#25D366',
          lightGreen: '#D9FDD3',
          lightBg: '#F7F8F6',
          chatBg: '#EFEAE2',
          chatBgDark: '#0B141A',
          darkBg: '#111B21',
          darkSurface: '#202C33',
          darkSurfaceLight: '#2A3942',
          darkMsgOut: '#005C4B',
          darkMsgIn: '#202C33',
          tealAccent: '#00A884',
          subtle: '#667781',
          subtleDark: '#8696A0',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

