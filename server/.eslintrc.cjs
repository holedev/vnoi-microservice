module.exports = {
  env: { es2020: true, node: true },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    requireConfigFile: false,
    babelOptions: {
      plugins: ["@babel/plugin-syntax-import-assertions"]
    },
    allowImportExportEverywhere: true
  },
  plugins: ["prettier"],
  rules: {
    "no-extra-boolean-cast": 0,
    "no-lonely-if": 1,
    "no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_"
      }
    ],
    "no-trailing-spaces": 1,
    "no-multi-spaces": 1,
    "no-multiple-empty-lines": 1,
    "space-before-blocks": ["error", "always"],
    "object-curly-spacing": [1, "always"],
    indent: [
      "warn",
      2,
      {
        SwitchCase: 1,
        ignoredNodes: ["ConditionalExpression"]
      }
    ],
    semi: [1, "always"],
    quotes: ["error", "double"],
    "array-bracket-spacing": 1,
    "linebreak-style": 0,
    "no-unexpected-multiline": "warn",
    "keyword-spacing": 1,
    "comma-dangle": 1,
    "comma-spacing": 1,
    "arrow-spacing": 1
  }
};
