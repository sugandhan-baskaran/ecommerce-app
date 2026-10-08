/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        ink: "#202124",
        coral: "#ff6b4a",
        butter: "#ffd166",
        mint: "#b8f2e6",
      },
    },
  },
  plugins: [],
};
