import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["build/", ".svelte-kit/", "node_modules/"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "off",
    },
  },
  ...svelte.configs["flat/recommended"],
  {
    files: ["**/*.svelte"],
    rules: {
      "svelte/no-at-html-tags": "off",
      "svelte/require-each-key": "off",
      "svelte/no-navigation-without-resolve": "off",
    },
  },
  prettier,
  ...svelte.configs["flat/prettier"],
];
