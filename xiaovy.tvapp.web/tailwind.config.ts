import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import lineClamp from "@tailwindcss/line-clamp";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        app: {
          bg: "var(--bg)", bg2: "var(--bg2)", surf: "var(--surf)", surf2: "var(--surf2)",
          line: "var(--line)", tx: "var(--tx)", tx2: "var(--tx2)", tx3: "var(--tx3)",
          acc: "var(--acc)", acc2: "var(--acc2)", "acc-soft": "var(--acc-soft)",
          tver: "var(--tver)", abema: "var(--abema)", yt: "var(--yt)", nico: "var(--nico)",
        },
      },
      animation: {
        'fade-out': 'fade-out 5s ease both'
      },
      keyframes: {
        'fade-out': {
          from: {
            opacity: '1'
          },
          to: {
            opacity: '0'
          }
        }
      },
    },
  },
  darkMode: "class",
  plugins: [
    typography,
    lineClamp,
    forms,
  ],
};
export default config;
