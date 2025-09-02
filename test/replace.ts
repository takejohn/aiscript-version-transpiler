import { assertEquals, assertThrows } from '@std/assert';
import { SliceReplacement } from '../src/utils.ts';
import { replaceSlices } from '../src/utils.ts';

Deno.test('replaceSlices', async (t) => {
	await t.step('valid', () => {
		const input = 'Ai is cute';
		const replacements = [
			{ start: 3, end: 4, content: 'am' },
			{ start: 6, end: 9, content: 'kawaii' },
		] as const satisfies readonly SliceReplacement[];
		const output = replaceSlices(input, replacements);
		assertEquals(output, 'Ai am kawaii');
	});

	await t.step('no replacements', () => {
		const input = 'Hello, World!';
		const replacements = [] as const satisfies readonly SliceReplacement[];
		const output = replaceSlices(input, replacements);
		assertEquals(output, input);
	});

	await t.step('adjacent ranges', () => {
		const input = 'abcde';
		const replacements = [
			{ start: 1, end: 2, content: 'X' },
			{ start: 3, end: 3, content: 'Y' },
		] as const satisfies readonly SliceReplacement[];
		const output = replaceSlices(input, replacements);
		assertEquals(output, 'aXYe');
	});

	await t.step('overlapping ranges', () => {
		const input = 'abcde';
		const replacement = [
			{ start: 1, end: 2, content: 'X' },
			{ start: 2, end: 3, content: 'Y' },
		] as const satisfies readonly SliceReplacement[];
		assertThrows(() => replaceSlices(input, replacement), RangeError);
	});
});
