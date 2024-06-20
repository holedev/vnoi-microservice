module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    // "plugin:import/recommended",
    "plugin:jsx-a11y/recommended",
    "eslint-config-prettier"
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: {
    react: { version: "18.2" }
  },
  plugins: ["react-refresh"],
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
    "react/react-in-jsx-scope": "off"
  }
};
