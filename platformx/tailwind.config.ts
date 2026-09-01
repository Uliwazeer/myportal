import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        surface: "#111111",
        surface2: "#1A1A1A",
        border: "#333333",
        ink: "#FFFFFF",
        muted: "#999999",
        accent: "#E60000",
        accent2: "#FF3333",
        success: "#28a745",
        danger: "#dc3545",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
