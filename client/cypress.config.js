import admin from "firebase-admin";
import { defineConfig } from "cypress";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { plugin as cypressFirebasePlugin } from "cypress-firebase";
import serviceAccount from "./serviceAccount.json" assert { type: "json" };
import webpackPreprocessor from "@cypress/webpack-preprocessor";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  projectId: "zwvgke",
  defaultCommandTimeout: 15000,
  component: {
    devServer: {
      framework: "react",
      bundler: "vite"
    }
  },
  e2e: {
    setupNodeEvents(on, config) {
      const options = {
        webpackOptions: {
          resolve: {
            alias: {
              "~": resolve(__dirname, "src")
            }
          }
        }
      };
      on("file:preprocessor", webpackPreprocessor(options));

      config.env.CYPRESS_BASE_URL = process.env.CYPRESS_BASE_URL;
      config.env.CYPRESS_API_URL = process.env.CYPRESS_API_URL;

      return cypressFirebasePlugin(on, config, admin, {
        credential: admin.credential.cert(serviceAccount)
      });
    }
  }
});
