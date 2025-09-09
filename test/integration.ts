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

describe('match', () => {
	test('about, keyword identifier', () => {
		const script = dedent`
			match this {
				0 => 1
			}
		`;
		const expected = dedent`
			match this_ {
				case 0 => 1
			}
		`;
		transpileAndValidate(script, expected);
	});
});

describe('obj', () => {
	test('value: namespace reference', () => {
		const script = '{ a: Ns:a }';
		transpileAndValidate(script, script);
	});

	test('with reserved word key, value: namespace reference', () => {
		const script = '{ class: Ns:a }';
		const expected = 'eval{let __AVT={}; __AVT["class"]= Ns:a; __AVT}';
		transpileAndValidate(script, expected);
	});

	test('value: with comments', () => {
		const script = dedent`
			{
				f: @() {
					// comment
				}
			}
		`;
		const expected = dedent`
			{
				f: @() {
					// comment
				}
			}
		`;
		transpileAndValidate(script, expected);
	});
});
