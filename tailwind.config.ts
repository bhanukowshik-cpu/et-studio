import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ET Studio palette — extracted from Figma file
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#3D3D3D",
          mute: "#6B6B6B",
          line: "#E5E5E5",
        },
        brand: {
          DEFAULT: "#00A862", // ET green
          50: "#E8F8F0",
          100: "#C4ECD7",
          500: "#00A862",
          600: "#008F53",
          700: "#007644",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F7F7F7",
          panel: "#FAFAFA",
        },
        accent: {
          amber: "#F5A623",
          red: "#E0533D",
          blue: "#2E72E8",
          purple: "#7B5BD9",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mulish: ["Mulish", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
        pop: "0 12px 32px rgba(16,24,40,0.16)",
      },
      borderRadius: {
        xl2: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
