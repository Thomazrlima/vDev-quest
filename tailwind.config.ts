import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b0d0c",
        coal: "#121613",
        panel: "#181b17",
        gold: "#d99a2b",
        "gold-light": "#f1c461",
        cream: "#f0dfb6",
        moss: "#344b39",
        ember: "#ba5d2b"
      },
      boxShadow: {
        pixel: "6px 6px 0 #070806",
        "pixel-gold": "6px 6px 0 #070806, 0 0 0 2px #6e4715",
        insetgold: "inset 0 0 0 2px rgba(241,196,97,.14)"
      },
      backgroundImage: {
        noise:
          "radial-gradient(circle at 20% 20%, rgba(241,196,97,.045) 0 1px, transparent 1px), radial-gradient(circle at 80% 60%, rgba(255,255,255,.025) 0 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
