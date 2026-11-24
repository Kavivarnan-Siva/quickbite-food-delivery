/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uber: {
          green: '#06C167',
          darkgreen: '#05944F',
          black: '#000000',
          dark: '#161616',
          card: '#1F1F1F',
          gray: '#545454',
          lightgray: '#EEEEEE',
          surface: '#F6F6F6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
