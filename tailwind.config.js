/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        workspace: {
          bg: "#0B0F17",
          panel: "#101623",
          surface: "#151C2C",
          hover: "#1A2338",
          border: "#1E293B",
          borderSubtle: "#334155",
          primary: "#10B981",
          primaryMuted: "rgba(16, 185, 129, 0.12)",
          accent: "#6366F1",
          cyan: "#06B6D4",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)",
        panel: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        highlight: "0 0 0 1px rgba(16, 185, 129, 0.25)",
      },
    },
  },
  plugins: [],
};

