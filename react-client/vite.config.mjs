import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react({ jsxRuntime: "classic" })],
  server: {
    port: 3000,
    proxy: {
      "/recipes": "http://localhost:5000",
      "/users": "http://localhost:5000",
      "/login": "http://localhost:5000",
      "/logged": "http://localhost:5000",
      "/logout": "http://localhost:5000",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
