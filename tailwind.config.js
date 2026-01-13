/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1e293b',
          secondary: '#334155',
          accent: '#0ea5e9',
          bg: '#f1f5f9', 
        }
      }
    },
  },
  plugins: [],
}