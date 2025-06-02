// eslint.config.js
const nextEslint = require('eslint-config-next');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // Apply Next.js default configurations.
  // `eslint-config-next` is expected to export a flat config array or a single config object.
  ...(Array.isArray(nextEslint) ? nextEslint : [nextEslint]),

  // Global ignores are often useful.
  {
    ignores: [
      "node_modules/", // Standard ignore
      ".next/",         // Next.js build output
      "out/",           // Next.js static export output
      // Add any other build or generated directories here
      // "build/",
      // "dist/",
      "fleetflowsub/", // Ignoring the new functions directory for now
    ],
  },

  // You can add more specific configurations or overrides below if needed.
  // For example, to apply rules only to certain files:
  // {
  //   files: ["src/app/**/*.ts?(x)"],
  //   rules: {
  //     "no-console": "warn", // Example custom rule
  //   },
  //   // If you have rules that require type information, ensure your tsconfig.json is correctly referenced.
  //   // eslint-config-next usually handles this, but for custom setups:
  //   // languageOptions: {
  //   //   parserOptions: {
  //   //     project: true, // Assumes tsconfig.json is at the root
  //   //     // tsconfigRootDir: __dirname, // if tsconfig.json is not at the root
  //   //   }
  //   // }
  // }
];
