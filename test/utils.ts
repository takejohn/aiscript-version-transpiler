import dedent from 'ts-dedent';
import { describe, expect, test } from 'vitest';
import { findLastNonWhitespaceCharacter, trySkipStrOrTmpl } from '../src/utils';

describe('findLastNonWhitespaceCharacter', () => {
	test('line comments', () => {
		const script = dedent`
			0 // comment
			1
		`;
		const position = script.indexOf('1');
		const expected = script.indexOf('0');
		const output = findLastNonWhitespaceCharacter(script, position);
		expect(output).toBe(expected);
	});

	test('obj with line comments between entries', () => {
		const script = dedent`
			{
				a: 0 // zero
				b: 1 // one
				c: 2 // two
			}
		`;
		const position = script.indexOf(': 1');
		const expected = script.indexOf('b');
		const output = findLastNonWhitespaceCharacter(script, position);
		expect(output).toBe(expected);
	});
});

describe('trySkipStrOrTmpl', () => {
	test('tmpl', () => {
		const script = '<: `1 + 1 = {1 + 1}`';
		const position = script.indexOf('`');
		const expected = script.length;
		const output = trySkipStrOrTmpl(script, position);
		expect(output).toBe(expected);
	});

	test('tmpl with escape', () => {
		const script = '<: `{0}\\`\\{\\}`';
		const position = script.indexOf('`');
		const expected = script.length;
		const output = trySkipStrOrTmpl(script, position);
		expect(output).toBe(expected);
	});

	test('tmpl with comments', () => {
		const script = '<: `{ /* { comment } */ 0 /* `comment` */ }`';
		const position = script.indexOf('`');
		const expected = script.length;
		const output = trySkipStrOrTmpl(script, position);
		expect(output).toBe(expected);
	});

	test('tmpl with expression including braces', () => {
		const script = '<: `{ if true { 0 } }`';
		const position = script.indexOf('`');
		const expected = script.length;
		const output = trySkipStrOrTmpl(script, position);
		expect(output).toBe(expected);
	});

	test('unterminated tmpl', () => {
		const script = '`{0}';
		const position = script.indexOf('`');
		expect(() => trySkipStrOrTmpl(script, position)).toThrow(TypeError);
	});

	test('single quote string', () => {
		const script = '<: \'Hello, world!\'';
		const position = script.indexOf('\'');
		const expected = script.length;
		const output = trySkipStrOrTmpl(script, position);
		expect(output).toBe(expected);
	});

	test('single quote string with escape', () => {
		const script = '<: \'foo\\\'bar\'';
		const position = script.indexOf('\'');
		const expected = script.length;
		const output = trySkipStrOrTmpl(script, position);
		expect(output).toBe(expected);
	});

	test('unterminated single quote string', () => {
		const script = '\'';
		const position = script.indexOf('\'');
		expect(() => trySkipStrOrTmpl(script, position)).toThrow(TypeError);
	});

	test('double quote string', () => {
		const script = '<: "Hello, world!"';
		const position = script.indexOf('"');
		const expected = script.length;
		const output = trySkipStrOrTmpl(script, position);
		expect(output).toBe(expected);
	});

	test('double quote string with escape', () => {
		const script = '<: "foo\\"bar"';
		const position = script.indexOf('"');
		const expected = script.length;
		const output = trySkipStrOrTmpl(script, position);
		expect(output).toBe(expected);
	});

	test('unterminated double quote string', () => {
		const script = '"';
		const position = script.indexOf('"');
		expect(() => trySkipStrOrTmpl(script, position)).toThrow(TypeError);
	});
});
