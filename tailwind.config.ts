import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f8f5ef",
        clay: "#c86f3d",
        clayDark: "#9f4f29",
        ink: "#1f2937",
        muted: "#6b6258",
        cream: "#fffaf2",
        warmBorder: "#e7d8c7",
        successSoft: "#ecfdf5",
        warningSoft: "#fffbeb",
        dangerSoft: "#fef2f2",
        app: {
          canvas: "#f8f5ef",
          surface: "#ffffff",
          soft: "#fffaf2",
          border: "#e7d8c7",
          accent: "#c86f3d",
          "accent-hover": "#9f4f29",
          "accent-soft": "#f8ece2",
          focus: "#c86f3d",
          danger: "#dc2626",
          "text-primary": "#1f2937",
          "text-secondary": "#3f3a34",
          "text-muted": "#6b6258"
        }
      },
      borderRadius: {
        "ui-xs": "0.5rem",
        field: "0.75rem",
        button: "0.8rem",
        "surface-compact": "0.9rem",
        surface: "1.1rem",
        hero: "1.4rem"
      },
      spacing: {
        "page-gutter": "1rem",
        "stack-compact": "0.75rem",
        "stack-section": "1.5rem",
        "panel-sm": "0.9rem",
        "panel-md": "1.25rem",
        "panel-lg": "1.75rem",
        "row-y": "0.75rem",
        "field-gap": "0.6rem",
        "actions-gap": "0.75rem"
      }
    },
  },
  plugins: [],
} satisfies Config;
