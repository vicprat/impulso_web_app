import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import path from 'path'
import { fileURLToPath } from 'url'

// Importación de plugins (solo los esenciales sin conflictos)
import nextPlugin from '@next/eslint-plugin-next'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import checkFile from 'eslint-plugin-check-file'
import noSecrets from 'eslint-plugin-no-secrets'
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'
import sortKeysFix from 'eslint-plugin-sort-keys-fix'
import unusedImports from 'eslint-plugin-unused-imports'
import importPlugin from 'eslint-plugin-import'
import tailwindcss from 'eslint-plugin-tailwindcss'
import tanstackQuery from '@tanstack/eslint-plugin-query'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = tseslint.config(
  // Base configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // TanStack Query and Tailwind CSS recommended configs
  ...tanstackQuery.configs['flat/recommended'],
  ...tailwindcss.configs['flat/recommended'],

  // Global ignores
  {
    ignores: [
      '.next/',
      'out/',
      'build/',
      'dist/',
      'node_modules/',
      '.env*',
      'coverage/',
      '.pnpm-debug.log*',
      '.yarn/',
      '.pnp.*',
      '.vscode/',
      '.idea/',
      '.DS_Store',
      'Thumbs.db',
    ],
  },

  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: { impliedStrict: true, jsx: true },
      },
      globals: { ...globals.browser, ...globals.node, ...globals.es2025 },
    },

    plugins: {
      '@next/next': nextPlugin,
      '@typescript-eslint': tseslint.plugin,
      '@tanstack/query': tanstackQuery,
      'check-file': checkFile,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'no-secrets': noSecrets,
      'sort-destructure-keys': sortDestructureKeys,
      'sort-keys-fix': sortKeysFix,
      'unused-imports': unusedImports,
      import: importPlugin,
      tailwindcss,
    },

    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
      next: { rootDir: __dirname },
      tailwindcss: {
        config: './tailwind.config.ts',
        callees: ['cn', 'clsx', 'cva'],
      },
    },

    rules: {
      // Next.js rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-duplicate-head': 'error',

      // TanStack Query rules
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/stable-query-client': 'error',

      // Tailwind CSS rules
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-contradicting-classname': 'error',

      // File naming (sin conflictos)
      'check-file/filename-naming-convention': [
        'warn',
        {
          'src/components/**/*.tsx': 'PascalCase',
          '**/*.{ts,tsx}': 'kebab-case',
        },
      ],

      // Import/Export optimizations (sin conflictos con prettier)
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // Sorting
      'sort-keys-fix/sort-keys-fix': 'warn',
      'sort-destructure-keys/sort-destructure-keys': 'warn',

      // Import order (simplificado para evitar conflictos)
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // TypeScript rules (sin conflictos con prettier)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-floating-promises': ['warn', { ignoreVoid: true }],

      // Core JavaScript rules (sin conflictos de formato)
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-template': 'warn',
      'object-shorthand': 'warn',
      'prefer-spread': 'warn',
      'prefer-rest-params': 'warn',

      // React rules (sin conflictos)
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Security
      'no-secrets/no-secrets': ['warn', { tolerance: 4.2 }],

      // Import extensions
      'import/extensions': [
        'error',
        'ignorePackages',
        { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
      ],
    },
  },

  // Configuración específica para React/JSX
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
    },
  },

  // App Router specific files
  {
    files: [
      '**/src/app/**/page.{ts,tsx}',
      '**/src/app/**/layout.{ts,tsx}',
      '**/src/app/**/loading.{ts,tsx}',
      '**/src/app/**/error.{ts,tsx}',
      '**/src/app/**/not-found.{ts,tsx}',
      '**/src/app/**/route.{ts,tsx}',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // Configuraciones específicas para diferentes tipos de archivos
  {
    files: ['**/*.config.{js,ts,mjs}', '**/next.config.{js,ts,mjs}', '**/tailwind.config.{js,ts}'],
    rules: {
      'import/no-default-export': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Prisma files
  {
    files: ['**/prisma/**/*.{ts,js}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Scripts directory
  {
    files: ['**/scripts/**/*.{ts,js}'],
    rules: {
      'no-console': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },

  // Modules directory (Modular Architecture)
  {
    files: ['**/src/modules/**/*.{ts,tsx}'],
    rules: {
      'import/no-cycle': 'warn',
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['../../../*'],
              message: 'Use absolute imports (@/modules/...) instead of deep relative imports',
            },
          ],
        },
      ],
    },
  },

  // Component library files
  {
    files: ['**/src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react/jsx-props-no-spreading': 'off',
    },
  }
)

export default config
