import dedent from 'ts-dedent';
import { describe, expect, test } from 'vitest';
import { findLastNonWhitespaceCharacter } from '../src/utils';

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
