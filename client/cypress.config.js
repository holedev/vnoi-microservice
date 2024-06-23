import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "zwvgke",
  defaultCommandTimeout: 1000,
  component: {
    devServer: {
      framework: "react",
      bundler: "vite"
    }
  },
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(_on, _config) {}
  }
});
