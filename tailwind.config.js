/** @type {import('tailwindcss').Config} */
// As cores vêm de variáveis CSS no formato "R G B" para o Tailwind conseguir
// aplicar transparência (ex.: border-primary/50, bg-base/80).
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: c("--primary"),
        accent: c("--accent"),
        glow: c("--glow"),
        base: c("--bg"),
        ink: c("--ink"),
      },
      boxShadow: {
        glow: "0 0 24px rgb(var(--glow) / 0.45)",
        glowlg: "0 0 70px rgb(var(--glow) / 0.30)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
      },
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1) translate3d(0,0,0)" },
          "100%": { transform: "scale(1.12) translate3d(-1.5%,-1%,0)" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 10px rgb(var(--glow) / 0.35)" },
          "50%": { boxShadow: "0 0 28px rgb(var(--glow) / 0.8)" },
        },
        bars: {
          "0%,100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        kenburns: "kenburns 40s ease-in-out infinite alternate",
        pulseGlow: "pulseGlow 2.6s ease-in-out infinite",
        bars: "bars 0.9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
