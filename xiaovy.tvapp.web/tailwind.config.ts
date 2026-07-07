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
        tver: {
          bg: '#fff7e9',
          ink: '#0d0d10',
          acc: '#ffd400',
          pink: '#ff2e88',
          'pink-ink': '#d81b6a',
          panel: '#0d0d10',
          'panel-card': '#1b1b22',
        },
        'tv-sec': {
          pink: '#ff2e88',
          yellow: '#f5a300',
          blue: '#0091d8',
          purple: '#6c2bd9',
          orange: '#ff5d1f',
        },
      },
      borderRadius: {
        card: '16px',
        thumb: '9px',
      },
      boxShadow: {
        'hard-sm': '2.5px 2.5px 0 #0d0d10',
        hard: '5px 5px 0 var(--acc, #0d0d10)',
        'hard-lg': '9px 9px 0 var(--acc, #0d0d10)',
        'hard-btn': '4px 4px 0 #0d0d10',
      },
      animation: {
        'fade-out': 'fade-out 5s ease both',
        'tv-marquee': 'tv-marquee 28s linear infinite',
        'tv-blink': 'tv-blink 1.6s ease infinite',
      },
      keyframes: {
        'fade-out': {
          from: {
            opacity: '1'
          },
          to: {
            opacity: '0'
          }
        },
        'tv-marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'tv-blink': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
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
