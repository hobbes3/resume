// prettier.config.js
import * as pluginToml from "prettier-plugin-toml";

export default {
  plugins: [pluginToml],
  overrides: [
    {
      files: "*.toml",
      options: {
        parser: "toml",
      },
    },
  ],
};
