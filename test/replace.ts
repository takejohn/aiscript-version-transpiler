import { describe, expect, test } from 'vitest';
import type { SliceReplacement } from '../src/utils.js';
import { replaceLineSeparators, replaceSlices } from '../src/utils.js';

describe('replaceSlices', () => {
	test('valid', () => {
		const input = 'Ai is cute';
		const replacements = [
			{ start: 3, end: 4, content: 'am' },
			{ start: 6, end: 9, content: 'kawaii' },
		] as const satisfies readonly SliceReplacement[];
		const output = replaceSlices(input, replacements);
		expect(output).toBe('Ai am kawaii');
	});

	test('no replacements', () => {
		const input = 'Hello, World!';
		const replacements = [] as const satisfies readonly SliceReplacement[];
		const output = replaceSlices(input, replacements);
		expect(output).toBe(input);
	});

	test('adjacent ranges', () => {
		const input = 'abcde';
		const replacements = [
			{ start: 1, end: 2, content: 'X' },
			{ start: 3, end: 3, content: 'Y' },
		] as const satisfies readonly SliceReplacement[];
		const output = replaceSlices(input, replacements);
		expect(output).toBe('aXYe');
	});

	test('overlapping ranges', () => {
		const input = 'abcde';
		const replacement = [
			{ start: 1, end: 2, content: 'X' },
			{ start: 2, end: 3, content: 'Y' },
		] as const satisfies readonly SliceReplacement[];
		expect(() => replaceSlices(input, replacement)).toThrow(RangeError);
	});
});

describe('replaceLineSeparactors', () => {
	test('plain text', () => {
		const input = ' ';
		const output = replaceLineSeparators(input);
		expect(output).toBe(input);
	});

	test('plain slash', () => {
		const input = '/ ';
		const output = replaceLineSeparators(input);
		expect(output).toBe(input);
	});

	test('single line feed', () => {
		const input = '\n';
		const output = replaceLineSeparators(input);
		expect(output).toBe(' ');
	});

	test('single carriage return', () => {
		const input = '\r';
		const output = replaceLineSeparators(input);
		expect(output).toBe(' ');
	});

	test('block comment with line separator', () => {
		const input = '/* comment\nmore comment */';
		const output = replaceLineSeparators(input);
		expect(output).toBe(input);
	});

	test('block comment with trailing line separator', () => {
		const input = '/* comment */\n';
		const output = replaceLineSeparators(input);
		expect(output).toBe('/* comment */ ');
	});

	test('asterisk in block comment', () => {
		const input = '/* * */\n';
		const output = replaceLineSeparators(input);
		expect(output).toBe('/* * */ ');
	});

	test('line comment', () => {
		const input = '// comment\n';
		const output = replaceLineSeparators(input);
		expect(output).toBe('/* comment\n*/ ');
	});

	test('unterminated block comment', () => {
		const input = '/* comment \n';
		expect(() => replaceLineSeparators(input)).toThrow(TypeError);
	});

	test('unterminated block comment with asterisk', () => {
		const input = '/* comment *';
		expect(() => replaceLineSeparators(input)).toThrow(TypeError);
	});

	test('unterminated line comment', () => {
		const input = '// comment';
		expect(() => replaceLineSeparators(input)).toThrow(TypeError);
	});
});
