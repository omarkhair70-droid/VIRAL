import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f8f5ef",
        clay: "#c86f3d"
      }
    },
  },
  plugins: [],
} satisfies Config;
