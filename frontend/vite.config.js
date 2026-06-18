import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    open: false,
  },
  preview: {
    port: 5173,
    strictPort: true,
    open: false,
  },
  test: {
    mockReset: true,
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    exclude: ["node_modules", "src/tests/e2e"],
  },
  plugins: [react()],
});
