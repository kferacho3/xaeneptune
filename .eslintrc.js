// .eslintrc.js
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,                         // makes sure ESLint stops at this folder
  ignorePatterns: ['.next/', 'node_modules/'],

  /* ------------------------------------------------------------------ *
   * 1. Base configs
   * ------------------------------------------------------------------ */
  extends: [
    'next/core-web-vitals',           // Next-specific + react-hooks rules
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended',    // ✨ must be last – turns Prettier into an ESLint rule
  ],

  /* ------------------------------------------------------------------ *
   * 2. Parser & settings
   * ------------------------------------------------------------------ */
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'import', 'prettier'],

  /* ------------------------------------------------------------------ *
   * 3. Rules – only the deltas you care about
   * ------------------------------------------------------------------ */
  rules: {
    /* React Hooks */
    'react-hooks/exhaustive-deps': 'warn', // default is error

    /* Unused vars (keep underscore conventions) */
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^__' },
    ],

    /* Expressions you intentionally leave dangling (e.g. short-circuit) */
    '@typescript-eslint/no-unused-expressions': 'off',

    /* Let Prettier handle formatting – any Prettier diff is an ESLint error. */
    'prettier/prettier': 'error',
  },
}
