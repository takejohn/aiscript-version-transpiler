import { test } from 'vitest';
import { transpileAndValidate } from './test_utils.js';

test('not', () => {
	const script = '!true';
	transpileAndValidate(script, script);
});

test('and', () => {
	const script = 'true && false';
	transpileAndValidate(script, script);
});

test('or', () => {
	const script = 'true || false';
	transpileAndValidate(script, script);
});
