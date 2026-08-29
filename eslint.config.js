import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import securityPlugin from "eslint-plugin-security";

export default defineConfig([
  ...tseslint.configs.recommended,
  securityPlugin.configs.recommended,
]);
