/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Thay emerald bằng blue
        blue: {
          50: '#eff6ff',
          100: '#dbeafe', // Nền nhạt
          500: '#3b82f6',
          600: '#2563eb', // Màu chính (Primary Brand)
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}