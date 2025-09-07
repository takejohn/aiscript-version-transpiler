import dedent from 'ts-dedent';
import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils';

describe('each', () => {
	test('item: array (space separated)', () => {
		const script = dedent`
			each let e, [0 1 2] {}
		`;
		const expected = dedent`
			each let e, [0, 1, 2] {}
		`;
		transpileAndValidate(script, expected);
	});

	test('line separated, body: each (line separated)', () => {
		const script = dedent`
			each let e0, [[0, 1, 2], [3, 4, 5]]
				each let e1, e0
					<: e1
		`;
		const expected = dedent`
			each let e0, [[0, 1, 2], [3, 4, 5]] each let e1, e0 <: e1
		`;
		transpileAndValidate(script, expected);
	});
});

describe('for', () => {
	test('times, times: call (space separated)', () => {
		const script = 'for f(0 1) {}';
		const expected = 'for f(0, 1) {}';
		transpileAndValidate(script, expected);
	});

	test('times with parentheses, times: call (space separated)', () => {
		const script = 'for (f(0 1)) {}';
		const expected = 'for (f(0, 1)) {}';
		transpileAndValidate(script, expected);
	});

	test('for: continue', () => {
		const script = dedent`
			for 2 {
				continue
			}
		`;
		transpileAndValidate(script, script);
	});
});
