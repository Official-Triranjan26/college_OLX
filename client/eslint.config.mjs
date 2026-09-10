// import js from "@eslint/js";
// import globals from "globals";
// import pluginReact from "eslint-plugin-react";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
//   pluginReact.configs.flat.recommended,
// ]);
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default [
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended, // 👍 Load React rules
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // 👍 Enable JSX parsing
        },
      },
      globals: {
        ...globals.browser, // 👈 Registers browser APIs (window, document)
      },
    },
    settings: {
      react: {
        version: "detect", // Automatically detects your React version
      },
    },
    // ... your other setup parameters
    rules: {
      "react/react-in-jsx-scope": "off",  // 👈 ADD THIS LINE HERE
      "react/prop-types": "off"  // 👈 ADD THIS LINE
    },
    //ignores: ["tailwind.config.js"] // 👈 Add this line
  },
  {
    ignores: ["tailwind.config.js"] // 👈 Add this line
  },
];

