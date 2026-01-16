import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import * as parserVue from 'vue-eslint-parser';
import configPrettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import * as parserTypeScript from '@typescript-eslint/parser';
import pluginTypeScript from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  {
    // 忽略文件
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts', 'public/**'],
  },
  // JavaScript/TypeScript 基础配置
  js.configs.recommended,
  // Vue 配置
  ...pluginVue.configs['flat/recommended'],
  // 全局变量配置
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // TypeScript 配置
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
        parser: {
          ts: parserTypeScript,
          js: parserTypeScript,
          jsx: parserTypeScript,
          tsx: parserTypeScript,
        },
      },
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginTypeScript.configs.recommended.rules,
      // Vue 规则
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/no-mutating-props': 'off', // 属性面板组件需要通过 Object.assign 更新 prop
      // TypeScript 规则
      'no-undef': 'off', // TypeScript 已经处理了这个
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // 通用规则
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },
  // Prettier 配置（必须最后）
  configPrettier,
];
