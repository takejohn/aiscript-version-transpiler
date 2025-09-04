import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils.js';
import dedent from 'ts-dedent';

test('not', () => {
	const script = '!true';
	transpileAndValidate(script, script);
});

test('and', () => {
	const script = 'true && false';
	transpileAndValidate(script, script);
});

test('or', () => {
	const script = 'true || false';
	transpileAndValidate(script, script);
});

describe('call', () => {
	test('basic', () => {
		const script = 'f()';
		transpileAndValidate(script, script);
	});

	test('comma separated arguments', () => {
		const script = 'f(1, 2, 3)';
		transpileAndValidate(script, script);
	});

	test('line separated arguments', () => {
		const script = dedent`
			f(
				1
				2
				3
			)
		`;
		transpileAndValidate(script, script);
	});

	test('space separated arguments', () => {
		const script = 'f(1 2 3)';
		const expected = 'f(1, 2, 3)';
		transpileAndValidate(script, expected);
	});

	test('print', () => {
		const script = '<: "Hello, world!"';
		transpileAndValidate(script, script);
	});

	test('eq', () => {
		const script = '1 == 2';
		transpileAndValidate(script, script);
	});

	test('neq', () => {
		const script = '1 != 2';
		transpileAndValidate(script, script);
	});

	test('lteq', () => {
		const script = '1 <= 2';
		transpileAndValidate(script, script);
	});

	test('gteq', () => {
		const script = '1 >= 2';
		transpileAndValidate(script, script);
	});

	test('lt', () => {
		const script = '1 < 2';
		transpileAndValidate(script, script);
	});

	test('gt', () => {
		const script = '1 > 2';
		transpileAndValidate(script, script);
	});

	test('add', () => {
		const script = '1 + 2';
		transpileAndValidate(script, script);
	});

	test('sub', () => {
		const script = '1 - 2';
		transpileAndValidate(script, script);
	});

	test('mul', () => {
		const script = '1 * 2';
		transpileAndValidate(script, script);
	});

	test('div', () => {
		const script = '1 / 2';
		transpileAndValidate(script, script);
	});

	test('mod', () => {
		const script = '1 % 2';
		transpileAndValidate(script, script);
	});

	test('nested', () => {
		const script = '(((1 + 2) * 3) / 4)';
		transpileAndValidate(script, script);
	});
});

test('index', () => {
	const script = 'a[0]';
	transpileAndValidate(script, script);
});

describe('prop', () => {
	test('basic', () => {
		const script = 'o.p';
		transpileAndValidate(script, script);
	});

	test('keyword', () => {
		const script = 'o.default';
		const expected = 'o["default"]';
		transpileAndValidate(script, expected);
	});
});
