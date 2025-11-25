import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils';

describe('version notation', () => {
	test('not to replace (default)', () => {
		const script = `
			/// @ 0.19.0
			<: "Hello, world!"
		`;
		transpileAndValidate(script, script);
	});

	test('not to replace (explicit)', () => {
		const script = `
			/// @ 0.19.0
			<: "Hello, world!"
		`;
		transpileAndValidate(script, script, { setVersionNotation: false });
	});

	test('to replace', () => {
		const script = `
			/// @ 0.19.0
			<: "Hello, world!"
		`;
		const expected = `
			/// @ 1.1.0
			<: "Hello, world!"
		`;
		transpileAndValidate(script, expected, { setVersionNotation: true });
	});
});
