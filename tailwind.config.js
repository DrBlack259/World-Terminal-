/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#020408",
          panel: "#050d14",
          border: "#0f2535",
          green: "#00ff88",
          "green-dim": "#00aa55",
          amber: "#ffb300",
          "amber-dim": "#cc8800",
          red: "#ff3366",
          "red-dim": "#cc1144",
          blue: "#00aaff",
          "blue-dim": "#0077cc",
          cyan: "#00ffee",
          purple: "#bb77ff",
          text: "#c8d8e8",
          "text-dim": "#5a7a8a",
          "text-muted": "#2a4a5a",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
      animation: {
        "scroll-left": "scrollLeft 60s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        blink: "blink 1s step-end infinite",
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        scrollLeft: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          from: { textShadow: "0 0 4px #00ff88" },
          to: { textShadow: "0 0 12px #00ff88, 0 0 24px #00ff88" },
        },
      },
      boxShadow: {
        "terminal-green": "0 0 20px rgba(0,255,136,0.15)",
        "terminal-red": "0 0 20px rgba(255,51,102,0.15)",
        "terminal-amber": "0 0 20px rgba(255,179,0,0.15)",
        "terminal-blue": "0 0 20px rgba(0,170,255,0.15)",
        panel: "inset 0 1px 0 rgba(0,255,136,0.05), 0 4px 24px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
