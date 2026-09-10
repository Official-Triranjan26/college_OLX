import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      // 👇 This registers Node.js global variables like require and process
      globals: {
        ...globals.node,
      },
    },
  },
];

