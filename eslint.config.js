import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist';

/** @type {import('eslint').Linter.Config[]} */
export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      perfectionist: eslintPluginPerfectionist,
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'perfectionist/sort-classes': [
        'error',
        {
          type: 'natural',
          order: [
            'decorators',
            'public-static-field',
            'protected-static-field',
            'private-static-field',
            'public-instance-field',
            'protected-instance-field',
            'private-instance-field',
            'constructor',
            'public-method',
            'protected-method',
            'private-method',
          ],
        },
      ],
    },
  },
];
