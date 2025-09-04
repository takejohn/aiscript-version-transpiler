import { dedent } from 'ts-dedent';
import { transpileAndValidate } from './test_utils.js';
import { describe, test } from 'vitest';

describe('if', () => {
	test('between if and cond', () => {
		const script = dedent`
			if
			true 1
		`;
		const expected = dedent`
			if true 1
		`;
		transpileAndValidate(script, expected);
	});

	test('between cond and then', () => {
		const script = dedent`
			if true
			1
		`;
		const expected = dedent`
			if true 1
		`;
		transpileAndValidate(script, expected);
	});

	test('between then and elif', () => {
		const script = dedent`
			if true 1
			elif false 0
		`;
		transpileAndValidate(script, script);
	});

	test('between elif and cond', () => {
		const script = dedent`
			if true 1
			elif
			false 0
		`;
		const expected = dedent`
			if true 1
			elif false 0
		`;
		transpileAndValidate(script, expected);
	});

	test('between cond and then of elseif', () => {
		const script = dedent`
			if true 1
			elif false
			0
		`;
		const expected = dedent`
			if true 1
			elif false 0
		`;
		transpileAndValidate(script, expected);
	});

	describe('between else and then', () => {
		test('no elif', () => {
			const script = dedent`
				if true 1
				else 0
			`;
			transpileAndValidate(script, script);
		});

		test('after elif', () => {
			const script = dedent`
				if true 1
				elif false 2
				else 0
			`;
			transpileAndValidate(script, script);
		});
	});

	describe('between else and then', () => {
		test('no elif', () => {
			const script = dedent`
				if true 1
				else
				0
			`;
			const expected = dedent`
				if true 1
				else 0
			`;
			transpileAndValidate(script, expected);
		});

		test('after elif', () => {
			const script = dedent`
				if true 1
				elif false 2
				else
				0
			`;
			const expected = dedent`
				if true 1
				elif false 2
				else 0
			`;
			transpileAndValidate(script, expected);
		});
	});
});

describe('fn', () => {
	describe('between arguments and body', () => {
		test('with name', () => {
			const script = dedent`
				@f()
				{
				}
			`;
			const expected = dedent`
				@f() {
				}
			`;
			transpileAndValidate(script, expected);
		});

		test('without name', () => {
			const script = dedent`
				@()
				{
				}
			`;
			const expected = dedent`
				@() {
				}
			`;
			transpileAndValidate(script, expected);
		});
	});
});

describe('comments between', () => {
	test('block comment', () => {
		const script = dedent`
			if true /* comment */
			1
		`;
		const expected = dedent`
			if true /* comment */ 1
		`;
		transpileAndValidate(script, expected);
	});

	test('block comment with line separator', () => {
		const script = dedent`
			if true /* comment
			more comment */ 1
		`;
		transpileAndValidate(script, script);
	});

	test('line comment', () => {
		const script = dedent`
			if true // comment
			1
		`;
		const expected = dedent`
			if true /* comment
			*/ 1
		`;
		transpileAndValidate(script, expected);
	});
});
