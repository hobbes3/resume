import js from "@eslint/js";
import securityPlugin from "eslint-plugin-security";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  securityPlugin.configs.recommended,
];
