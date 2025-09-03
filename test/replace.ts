import { describe, expect, test } from 'vitest';
import type { SliceReplacement } from '../src/utils.js';
import { replaceSlices } from '../src/utils.js';

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
