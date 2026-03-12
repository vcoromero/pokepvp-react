import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Enforce basic architectural boundaries
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // shared layer must not import features
            {
              group: ['@/features/*'],
              message: 'shared/ layer cannot import from features/ (violates layering).',
            },
            // features should not cross-import other features directly
            {
              group: ['@/features/*/*'],
              message: 'Feature modules should not import other feature modules directly.',
            },
          ],
        },
      ],
    },
  },
])
