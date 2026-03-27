import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api/n8n": {
        target: "https://rtyui.app.n8n.cloud",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, ""),
      },
      "/api/chat": {
        target:
          "https://rtyui.app.n8n.cloud/webhook/3babe261-ee55-46b6-b2c9-2d6c918b939c/chat",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, ""),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
}));
