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
    rules: {},
  },
  // shared/ must not import from features/
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features*'],
              message: 'shared/ must not import from features/ (layering).',
            },
          ],
        },
      ],
    },
  },
  // domain/ must not depend on application, infrastructure, or features
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/application*', '@/infrastructure*', '@/features*'],
              message:
                'domain/ must not import from application, infrastructure, or features (hexagonal boundaries).',
            },
          ],
        },
      ],
    },
  },
  // application/ must not depend on features or infrastructure
  {
    files: ['src/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features*', '@/infrastructure*'],
              message:
                'application/ must not import from features or infrastructure (hexagonal boundaries).',
            },
          ],
        },
      ],
    },
  },
  // features/ must not import infrastructure or other feature modules (app/ may import both for routing and wiring)
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/infrastructure*'],
              message:
                'features/ must not import infrastructure directly; use application services or shared (hexagonal boundaries).',
            },
            {
              group: ['@/features/*/*'],
              message: 'Feature modules must not import other feature modules directly.',
            },
          ],
        },
      ],
    },
  },
])
