import type { Config } from "tailwindcss";

// 设计令牌：「纸上碑林 · 数字楼观」配色体系
// 宣纸 / 墨色 / 朱砂 / 青铜 / 松黛
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F4EFE4", // --paper 暖宣纸
          light: "#FBF8F1", // --paper-light
          deep: "#E9E0CF", // --paper-deep
          50: "#FBF8F1",
          100: "#F4EFE4",
          200: "#E9E0CF",
          300: "#DCD2BE",
        },
        ink: {
          DEFAULT: "#25231F", // --ink 墨色
          soft: "#5E594F", // --ink-soft
          light: "#8B857A", // --ink-light
          100: "#ECE8DF",
          200: "#E0DACD",
          300: "#CFC7B6",
          400: "#8B857A",
          500: "#6B665C",
          600: "#5E594F",
          700: "#3B3831",
          800: "#2C2A25",
          900: "#25231F",
          950: "#1A1915",
        },
        cinnabar: {
          DEFAULT: "#A63D32", // --cinnabar 朱砂
          dark: "#7D2D27", // --cinnabar-dark
          50: "#F7E9E6",
          100: "#EFD4CF",
          200: "#DEA9A1",
          300: "#C9796F",
          400: "#B85B4E",
          500: "#A63D32",
          600: "#8E342B",
          700: "#7D2D27",
        },
        bronze: {
          DEFAULT: "#9A7B4F", // --bronze 青铜
          light: "#C2A36B", // --bronze-light
          400: "#C2A36B",
          500: "#9A7B4F",
          600: "#7C6240",
        },
        pine: {
          DEFAULT: "#35483B", // --pine 松黛
          500: "#35483B",
          600: "#2A3A30",
          700: "#223029",
        },
      },
      fontFamily: {
        serif: ["Songti SC", "STSong", "SimSun", "serif"],
        fangsong: ["FangSong", "STFangsong", "FangSong_GB2312", "serif"],
      },
      borderRadius: {
        xs: "3px",
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        // 极轻阴影：主视觉依赖留白、边框、层级，而非重阴影
        hairline: "0 1px 2px rgba(37, 35, 31, 0.04)",
        soft: "0 2px 8px rgba(37, 35, 31, 0.06)",
        lift: "0 6px 18px rgba(37, 35, 31, 0.08)",
      },
      maxWidth: {
        // 桌面主体 1200~1360px
        shell: "1280px",
        // 正文阅读区 760~840px
        reading: "800px",
      },
      letterSpacing: {
        spread: "0.12em", // 东方编辑感大间距（标题）
        airy: "0.04em", // 碑文舒适字距
      },
    },
  },
  plugins: [],
};

export default config;
