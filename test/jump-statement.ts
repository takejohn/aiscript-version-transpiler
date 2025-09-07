import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils.js';

describe('break', () => {
	test('in toplevel', () => {
		const script = 'break';
		const expected = 'Core:abort("")';
		transpileAndValidate(script, expected);
	});

	test('in function', () => {
		const script = '@() { break }';
		const expected = '@() { Core:abort("") }';
		transpileAndValidate(script, expected);
	});
});

describe('continue', () => {
	test('in toplevel', () => {
		const script = 'continue';
		const expected = 'Core:abort("")';
		transpileAndValidate(script, expected);
	});

	test('in function', () => {
		const script = '@() { continue }';
		const expected = '@() { Core:abort("") }';
		transpileAndValidate(script, expected);
	});
});

describe('return', () => {
	test('in if', () => {
		const script = 'if true { return null }';
		const expected = 'if true { eval{ null;Core:abort("")} }';
		transpileAndValidate(script, expected);
	});
});
