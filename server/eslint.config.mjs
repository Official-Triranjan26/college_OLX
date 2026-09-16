// import globals from "globals";
// import pluginJs from "@eslint/js";

// export default [
//   pluginJs.configs.recommended,
//   {
//     languageOptions: {
//       // 👇 This registers Node.js global variables like require and process
//       globals: {
//         ...globals.node,
//       },
//     },
//   },
// ];

import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest, // <-- Registers Jest testing globals (describe, it, expect, etc.)
      },
    },
  },
];

