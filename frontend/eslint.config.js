import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/components/ui/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../../*', '../../../*', '../../../../*'],
              message: 'Use @/ absolute imports instead of parent-relative imports.',
            },
            {
              group: [
                '@mui/*',
                'antd',
                'antd/*',
                'react-bootstrap',
                'bootstrap',
                '@chakra-ui/*',
                '@headlessui/*',
                'primereact/*',
                '@nextui-org/*',
                'flowbite-react',
                'semantic-ui-react',
                '@mantine/*',
              ],
              message: 'Use shadcn UI components from @/components/ui only.',
            },
            {
              group: ['@radix-ui/*'],
              message: 'Do not import Radix directly outside src/components/ui. Wrap primitives in shadcn UI components first.',
            },
          ],
        },
      ],
    },
  },
];
