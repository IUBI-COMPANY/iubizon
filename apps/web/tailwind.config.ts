import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        scalePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-10px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-10px) scale(0.95)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        scalePulse: "scalePulse 1.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "fade-out": "fade-out 0.3s ease-in forwards",
        shake: "shake 0.5s ease-in-out",
      },
      animationDelay: {
        "100": "0.1s",
        "200": "0.2s",
        "300": "0.3s",
        "500": "0.5s",
        "700": "0.7s",
        "800": "0.8s",
        "1000": "1s",
        "1200": "1.2s",
        "1500": "1.5s",
        "1800": "1.8s",
      },
    },
  },
  plugins: [],
};

export default config;
