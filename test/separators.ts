import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils';
import dedent from 'ts-dedent';

describe('function arguments', () => {
	describe('function expression', () => {
		test('comma separated', () => {
			const script = '@(a, b, c) {}';
			transpileAndValidate(script, script);
		});

		test('line separated', () => {
			const script = dedent`
				@(
					a
					b
					c
				) {}
			`;
			transpileAndValidate(script, script);
		});

		test('space separated', () => {
			const script = '@(a b c) {}';
			const expected = '@(a, b, c) {}';
			transpileAndValidate(script, expected);
		});
	});

	describe('function definition', () => {
		test('comma separated', () => {
			const script = '@f(a, b, c) {}';
			transpileAndValidate(script, script);
		});

		test('line separated', () => {
			const script = dedent`
				@f(
					a
					b
					c
				) {}
			`;
			transpileAndValidate(script, script);
		});

		test('space separated', () => {
			const script = '@f(a b c) {}';
			const expected = '@f(a, b, c) {}';
			transpileAndValidate(script, expected);
		});
	});
});

describe('function type annotation', () => {
	test('comma separated', () => {
		const script = 'var f: @(num, num) => num = null';
		transpileAndValidate(script, script);
	});

	test('line separated', () => {
		const script = dedent`
			var f: @(
				num
				num
			) => num = null
		`;
		const expected = dedent`
			var f: @( num, num ) => num = null
		`;
		transpileAndValidate(script, expected);
	});

	test('space separated', () => {
		const script = 'var f: @(num num) => num = null';
		const expected = 'var f: @(num, num) => num = null';
		transpileAndValidate(script, expected);
	});
});
