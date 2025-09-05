import { test } from 'vitest';
import { transpileAndValidate } from './test_utils';

test('named type', () => {
	const script = 'let a: num = 0';
	transpileAndValidate(script, script);
});

test('named type with parameter', () => {
	const script = 'let a: arr<num> = [0, 1]';
	transpileAndValidate(script, script);
});

test('function type with no arguments', () => {
	const script = 'let f: @() => void = @() {}';
	transpileAndValidate(script, script);
});

test('function type with argument', () => {
	const script = 'let f: @(num) => void = @(a) {}';
	transpileAndValidate(script, script);
});

test('function type with arguments', () => {
	const script = 'let f: @(num, num) => void = @(a) {}';
	transpileAndValidate(script, script);
});
