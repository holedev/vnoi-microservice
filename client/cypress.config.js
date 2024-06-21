import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "zwvgke",
  defaultCommandTimeout: 1000,
  component: {
    devServer: {
      framework: "react",
      bundler: "vite"
    }
  }
});
