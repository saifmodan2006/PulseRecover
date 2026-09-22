/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#E5E7EB",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F9FAFB",
          muted: "#F3F4F6",
        },
        charcoal: {
          DEFAULT: "#111827",
          muted: "#4B5563",
          subtle: "#9CA3AF",
        },
        brand: {
          DEFAULT: "#0F172A",
          hover: "#1E293B",
          accent: "#2563EB",
        },
        risk: {
          low: {
            bg: "#F0FDF4",
            text: "#166534",
            border: "#BBF7D0",
          },
          medium: {
            bg: "#FEFCE8",
            text: "#854D0E",
            border: "#FEF08A",
          },
          high: {
            bg: "#FFF7ED",
            text: "#9A3412",
            border: "#FFEDD5",
          },
          critical: {
            bg: "#FEF2F2",
            text: "#991B1B",
            border: "#FECACA",
          },
          recovered: {
            bg: "#ECFDF5",
            text: "#065F46",
            border: "#A7F3D0",
          },
        },
      },
      borderRadius: {
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};
