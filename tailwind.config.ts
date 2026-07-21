import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1F2A24",
        paper: "#F7F5EF",
        moss: "#3F5A45",
        moss2: "#2E4433",
        clay: "#C7703A",
        mist: "#E4E7DF",
        line: "#D8D3C4",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
