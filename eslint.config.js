import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type { import("eslint").Linter.FlatConfig[] } */
export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
