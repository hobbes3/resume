import tseslint from "typescript-eslint";
import securityPlugin from "eslint-plugin-security";

export default tseslint.config(
  ...tseslint.configs.recommended,
  securityPlugin.configs.recommended,
);
