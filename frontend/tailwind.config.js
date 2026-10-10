/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#fdf2f8', 100:'#fce7f3', 500:'#ec4899', 600:'#db2777', 700:'#be185d' },
        rose: { 50:'#fff1f2', 500:'#f43f5e', 600:'#e11d48' }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
