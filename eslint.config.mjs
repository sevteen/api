import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import sonarjsPlugin from "eslint-plugin-sonarjs";

// Common rules for NestJS
const commonRules = {
  "func-names": "warn",
  "no-bitwise": "error",
  "no-unused-vars": "off",
  "object-shorthand": "warn",
  "no-useless-rename": "warn",
  "default-case-last": "error",
  "consistent-return": "error",
  "no-constant-condition": "warn",
  "default-case": ["error", { commentPattern: "^no default$" }],
  "lines-around-directive": ["error", { before: "always", after: "always" }],
  "arrow-body-style": [
    "error",
    "as-needed",
    { requireReturnForObjectLiteral: false },
  ],
  // TypeScript specific
  "@typescript-eslint/no-shadow": "error",
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "@typescript-eslint/explicit-module-boundary-types": "warn",
  "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
  "@typescript-eslint/consistent-type-imports": "warn",
  // SonarJS rules
  "sonarjs/no-duplicate-string": "warn",
  "sonarjs/cognitive-complexity": ["error", 15],
  "sonarjs/no-identical-functions": "warn",
  "sonarjs/no-redundant-jump": "error",
  "sonarjs/no-small-switch": "warn",
  "sonarjs/prefer-immediate-return": "warn",
};

// Import rules
const importRules = {
  ...importPlugin.configs.recommended.rules,
  "import/named": "off",
  "import/namespace": "off",
  "import/default": "off",
  "import/no-named-as-default": "off",
  "import/no-named-as-default-member": "off",
  "import/newline-after-import": "error",
};

// Unused imports rules
const unusedImportsRules = {
  "unused-imports/no-unused-imports": "warn",
  "unused-imports/no-unused-vars": [
    "warn",
    {
      vars: "all",
      varsIgnorePattern: "^_",
      args: "after-used",
      argsIgnorePattern: "^_",
    },
  ],
};

// Perfectionist rules for clean code organization
const perfectionistRules = {
  "perfectionist/sort-named-imports": [
    "warn",
    { type: "line-length", order: "asc" },
  ],
  "perfectionist/sort-named-exports": [
    "warn",
    { type: "line-length", order: "asc" },
  ],
  "perfectionist/sort-exports": [
    "warn",
    {
      type: "line-length",
      order: "asc",
    },
  ],
  "perfectionist/sort-imports": [
    "error",
    {
      type: "line-length",
      order: "asc",
      groups: [
        "type",
        ["builtin", "external"],
        "internal-type",
        "internal",
        ["parent-type", "sibling-type", "index-type"],
        ["parent", "sibling", "index"],
        "object",
        "unknown",
      ],
      newlinesBetween: "always",
      internalPattern: ["^src/"],
    },
  ],
};

export const customConfig = {
  plugins: {
    import: importPlugin,
    perfectionist: perfectionistPlugin,
    "unused-imports": unusedImportsPlugin,
    sonarjs: sonarjsPlugin,
  },
  settings: {
    // https://www.npmjs.com/package/eslint-import-resolver-typescript
    ...importPlugin.configs.typescript.settings,
    "import/resolver": {
      ...importPlugin.configs.typescript.settings["import/resolver"],
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    ...commonRules,
    ...importRules,
    ...unusedImportsRules,
    ...perfectionistRules,
  },
};

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { ignores: ["eslint.config.*", "dist/**", "node_modules/**"] },

  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  customConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
