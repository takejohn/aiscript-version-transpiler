import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils.js';

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
});
