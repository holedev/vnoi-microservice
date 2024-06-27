import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // eslint-disable-next-line no-undef
    "process.env.SECRET": process.env.SECRET,
    _global: {}
  },
  resolve: {
    alias: [{ find: "~", replacement: "/src" }]
  },
  server: {
    host: true
  }
});
