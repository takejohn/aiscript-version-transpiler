import { test } from 'vitest';
import { transpileAndValidate } from './test_utils.js';

test('not', () => {
	const script = '!true';
	transpileAndValidate(script, script);
});
