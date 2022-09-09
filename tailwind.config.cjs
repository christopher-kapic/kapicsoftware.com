/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"), require('@tailwindcss/typography'),],
  daisyui: {
    themes: [
      {
        default: {
          primary: "#5ec169",
          secondary: "#7234de",
          accent: "#eb4a3d",
          neutral: "#2c3341",
          "base-100": "#f3f4f6",
          info: "#3ABFF8",
          success: "#4ade80",
          warning: "#fcd34d",
          error: "#F87272",
        },
      },
    ],
  },
};
