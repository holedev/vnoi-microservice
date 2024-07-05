module.exports = {
  root: true,
  env: { browser: true, es2020: true, "cypress/globals": true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:cypress/recommended",
    "plugin:jsx-a11y/recommended",
    "eslint-config-prettier"
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "node_modules", "coverage", "cypress.config.js"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    requireConfigFile: false,
    babelOptions: {
      plugins: ["@babel/plugin-syntax-import-assertions"]
    },
    allowImportExportEverywhere: true
  },
  settings: {
    react: { version: "18.2" }
  },
  plugins: ["react-refresh", "cypress"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "off",
    "no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_"
      }
    ],
    "react/react-in-jsx-scope": "off",
    "cypress/no-assigning-return-values": "error",
    "cypress/assertion-before-screenshot": "warn",
    "cypress/no-force": "warn",
    "cypress/no-async-tests": "error",
    "cypress/no-async-before": "error",
    "cypress/no-pause": "error",
    "cypress/no-unnecessary-waiting": "off"
  }
};
