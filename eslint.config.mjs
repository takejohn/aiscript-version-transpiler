// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig(
	{
		ignores: ['**/*.js'],
	},
	{
		files: ['src/**/*.ts', 'test/**/*.ts'],
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	stylistic.configs.customize({
		indent: 'tab',
		quotes: 'single',
		semi: true,
		jsx: false,
		arrowParens: true,
		braceStyle: '1tbs',
		blockSpacing: true,
		quoteProps: 'as-needed',
		commaDangle: 'always-multiline',
		severity: 'error',
	}),
);
