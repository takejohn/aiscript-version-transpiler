import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils';
import dedent from 'ts-dedent';

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

	test('with expression in parentheses', () => {
		const script = '`{ (1 + 2) }`';
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

describe('obj', () => {
	test('keyword key', () => {
		const script = '{ default: 0 }';
		transpileAndValidate(script, script);
	});

	test('comma separated', () => {
		const script = '{ a: 0, b: 1 }';
		transpileAndValidate(script, script);
	});

	test('line separated', () => {
		const script = dedent`{
			a: 0
			b: 1
		}`;
		transpileAndValidate(script, script);
	});

	test('space separated', () => {
		const script = '{ a: 0 b: 1 }';
		const expected = '{ a: 0, b: 1 }';
		transpileAndValidate(script, expected);
	});

	test('semicolon separated', () => {
		const script = '{ a: 0; b: 1 }';
		const expected = '{ a: 0, b: 1 }';
		transpileAndValidate(script, expected);
	});

	test('semicolon + line separated', () => {
		const script = dedent`
			{
				a: 0;
				b: 1;
			}
		`;
		const expected = dedent`
			{
				a: 0,
				b: 1,
			}
		`;
		transpileAndValidate(script, expected);
	});

	test('variable value', () => {
		const script = '{ a: a }';
		transpileAndValidate(script, script);
	});

	test('value in nested parentheses', () => {
		const script = '{ a: ((0)) }';
		transpileAndValidate(script, script);
	});

	test('duplicated keys', () => {
		const script = dedent`
			{
				a: 0
				b: 1
				c: 2
				b: 3
				d: 4
			}
		`;
		const expected = dedent`
			{
				a: 0
				b: 3
				c: 2
				
				d: 4
			}
		`;
		transpileAndValidate(script, expected);
	});

	test('duplicated reserved word keys', () => {
		const script = dedent`
			{
				a: 0
				class: 1
				b: 2
				class: 3
				c: 4
			}
		`;
		const expected = dedent`
			eval{let __AVT={};
				__AVT.a= 0
				__AVT["class"]= 3
				__AVT.b= 2
				
				__AVT.c= 4
			__AVT}
		`;
		transpileAndValidate(script, expected);
	});
});

describe('arr', () => {
	test('comma separated', () => {
		const script = '[0, 1, 2]';
		transpileAndValidate(script, script);
	});

	test('line separated', () => {
		const script = `
			[
				0
				1
				2
			]
		`;
		transpileAndValidate(script, script);
	});

	test('space separated', () => {
		const script = '[0 1 2]';
		const expected = '[0, 1, 2]';
		transpileAndValidate(script, expected);
	});

	test('space separated, with parentheses enclosing item', () => {
		const script = '[(-1) 1]';
		const expected = '[(-1), 1]';
		transpileAndValidate(script, expected);
	});

	test('space separated, with function call item', () => {
		const script = '[f() 0]';
		const expected = '[f(), 0]';
		transpileAndValidate(script, expected);
	});
});

test('tmpl and string', () => {
	const script = dedent`
		\`{0}\`
		"\`"
	`;
	transpileAndValidate(script, script);
});
