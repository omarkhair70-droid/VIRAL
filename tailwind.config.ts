import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f8f5ef",
        clay: "#c86f3d",
        ink: "#1f2937",
        muted: "#6b6258",
        cream: "#fffaf2",
        warmBorder: "#e7d8c7",
        clayDark: "#9f4f29",
        successSoft: "#ecfdf5",
        warningSoft: "#fffbeb",
        dangerSoft: "#fef2f2"
      }
    },
  },
  plugins: [],
} satisfies Config;
