import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist', 'build', '*.config.js', 'eslint.config.js'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-console': 'error',
      'no-inline-comments': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-undef': 'error',
      'no-magic-numbers': [
        'warn',
        { ignore: [0, 1], ignoreArrayIndexes: true },
      ],
      'consistent-return': 'error',
      'no-else-return': 'error',
      'no-use-before-define': 'error',
      'prefer-const': 'error',
      eqeqeq: 'error',
      complexity: ['warn', 15],
      'id-length': ['warn', { min: 3, exceptions: ['i', 'j', 'k', 'id', 'to', 'x', 'y'] }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-magic-numbers': 'off',
    },
  },
  {
    files: ['**/constants/index.ts', 'src/constants/index.ts'],
    rules: {
      'no-magic-numbers': 'off',
    },
  },
  eslintConfigPrettier,
];
