import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils';

describe('tmpl', () => {
	test('backslash', () => {
		const script = '`foo\\bar`';
		const expected = '`foo\\\\bar`';
		transpileAndValidate(script, expected);
	});

	test('escaped back quote', () => {
		const script = '`\\``';
		transpileAndValidate(script, script);
	});

	test('escaped left brace', () => {
		const script = '`\\{`';
		transpileAndValidate(script, script);
	});

	test('escaped right brace', () => {
		const script = '`\\}`';
		transpileAndValidate(script, script);
	});

	test('with expressions', () => {
		const script = '`{ 1 } + { 2 }`';
		transpileAndValidate(script, script);
	});
});

describe('str', () => {
	test('single quote', () => {
		const script = `'Hello, world!'`;
		transpileAndValidate(script, script);
	});

	test('double quote', () => {
		const script = `"Hello, world!"`;
		transpileAndValidate(script, script);
	});

	test('single quote with backslash', () => {
		const script = String.raw`'foo\bar'`;
		const expected = String.raw`'foo\\bar'`;
		transpileAndValidate(script, expected);
	});

	test('double quote with backslash', () => {
		const script = String.raw`"foo\bar"`;
		const expected = String.raw`"foo\\bar"`;
		transpileAndValidate(script, expected);
	});

	test('single quote with escape', () => {
		const script = String.raw`'foo\'bar'`;
		const expected = String.raw`'foo\'bar'`;
		transpileAndValidate(script, expected);
	});

	test('double quote with escape', () => {
		const script = String.raw`"foo\"bar"`;
		const expected = String.raw`"foo\"bar"`;
		transpileAndValidate(script, expected);
	});

	test('single quote with backslashes', () => {
		const script = String.raw`'foo\\bar'`;
		const expect = String.raw`'foo\\\\bar'`;
		transpileAndValidate(script, expect);
	});

	test('double quote with backslashes', () => {
		const script = String.raw`"foo\\bar"`;
		const expect = String.raw`"foo\\\\bar"`;
		transpileAndValidate(script, expect);
	});
});

test('obj', () => {
	const script = '{ default: 0 }';
	transpileAndValidate(script, script);
});

test('arr', () => {
	const script = '[0, 1, 2]';
	transpileAndValidate(script, script);
});
