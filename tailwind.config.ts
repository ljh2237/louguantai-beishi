import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#faf6ee",
          100: "#f4ecd9",
          200: "#e8dcc2",
          300: "#d8c6a2",
        },
        ink: {
          400: "#8a7a5e",
          500: "#6b5d43",
          600: "#54482f",
          700: "#3f3522",
          800: "#2c2416",
          900: "#1f1910",
        },
        gold: {
          400: "#c9a86a",
          500: "#b08d4f",
          600: "#93723c",
        },
      },
      fontFamily: {
        serif: [
          "Songti SC",
          "STSong",
          "SimSun",
          "FangSong",
          "STFangsong",
          "serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
