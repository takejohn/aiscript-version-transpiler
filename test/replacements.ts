import dedent from 'ts-dedent';
import { describe, expect, test } from 'vitest';
import { getActualLocation, replaceNodeAndLineSeparatorsInParentheses } from '../src/replacements/main';
import { Parser } from 'aiscript@0.19.0';
import { requireType } from './test_utils';

describe('replaceNodeAndLineSeparatorsInParentheses', () => {
	test('no parentheses', () => {
		const script = '0';
		const ast = Parser.parse(script);
		const node = ast[0]!;
		const output = replaceNodeAndLineSeparatorsInParentheses(node, script, []);
		expect(output).toBe('0');
	});

	test('parentheses', () => {
		const script = '(0)';
		const ast = Parser.parse(script);
		const node = ast[0]!;
		const output = replaceNodeAndLineSeparatorsInParentheses(node, script, []);
		expect(output).toBe('(0)');
	});

	test('nested parentheses', () => {
		const script = '((0))';
		const ast = Parser.parse(script);
		const node = ast[0]!;
		const output = replaceNodeAndLineSeparatorsInParentheses(node, script, []);
		expect(output).toBe('((0))');
	});

	test('parentheses and line separators', () => {
		const script = dedent`
			(
				0
			)
		`;
		const expected = dedent`
			( 0 )
		`;
		const ast = Parser.parse(script);
		const node = ast[0]!;
		const output = replaceNodeAndLineSeparatorsInParentheses(node, script, []);
		expect(output).toBe(expected);
	});

	test('nested parentheses and line separators', () => {
		const script = dedent`
			(
				(
					0
				)
			)
		`;
		const expected = dedent`
			( ( 0 ) )
		`;
		const ast = Parser.parse(script);
		const node = ast[0]!;
		const output = replaceNodeAndLineSeparatorsInParentheses(node, script, []);
		expect(output).toBe(expected);
	});

	test('parentheses in parameter list', () => {
		const script = 'f((0))';
		const ast = Parser.parse(script);
		const call = requireType(ast[0], 'call');
		const arg = call.args[0]!;
		const output = replaceNodeAndLineSeparatorsInParentheses(arg, script, [call], {
			start: call.loc!.start + 1,
			end: call.loc!.end - 1,
		});
		expect(output).toBe('(0)');
	});

	test('no parenthesis in parameter list', () => {
		const script = 'f(0)';
		const ast = Parser.parse(script);
		const call = requireType(ast[0], 'call');
		const arg = call.args[0]!;
		const output = replaceNodeAndLineSeparatorsInParentheses(arg, script, [call], {
			start: call.loc!.start + 1,
			end: call.loc!.end - 1,
		});
		expect(output).toBe('0');
	});

	test('parentheses in parameter list with line separators', () => {
		const script = dedent`
			f((
				0
			))
		`;
		const ast = Parser.parse(script);
		const call = requireType(ast[0], 'call');
		const arg = call.args[0]!;
		const output = replaceNodeAndLineSeparatorsInParentheses(arg, script, [call], {
			start: call.loc!.start + 1,
			end: call.loc!.end - 1,
		});
		expect(output).toBe('( 0 )');
	});

	test('no parenthesis in parameter list with line separators', () => {
		const script = dedent`
			f(
				0
			)
		`;
		const ast = Parser.parse(script);
		const call = requireType(ast[0], 'call');
		const arg = call.args[0]!;
		const output = replaceNodeAndLineSeparatorsInParentheses(arg, script, [call], {
			start: call.loc!.start + 1,
			end: call.loc!.end - 1,
		});
		expect(output).toBe('0');
	});

	test('nested parentheses as object value', () => {
		const script = '{ a: ((0)) }';
		const ast = Parser.parse(script);
		const obj = requireType(ast[0], 'obj');
		const value = obj.value.get('a')!;
		const output = replaceNodeAndLineSeparatorsInParentheses(value, script, [obj], {
			start: 5,
			end: 9,
		});
		expect(output).toBe('((0))');
	});
});

describe('getActualLocation', () => {
	test('nested parentheses as object value', () => {
		const script = '{ a: ((0)) }';
		const ast = Parser.parse(script);
		const obj = requireType(ast[0], 'obj');
		const value = obj.value.get('a')!;
		const output = getActualLocation(value, script, true);
		expect(output).toStrictEqual({ start: 5, end: 9 });
	});
});
