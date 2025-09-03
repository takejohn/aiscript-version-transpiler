import { expect } from 'vitest';
import { transpile } from '../src/main.js';
import { Parser } from 'aiscript@1.1.0';

export function transpileAndValidate(script: string, expected: string): void {
	const output = transpile(script);
	expect(output).toBe(expected);
	Parser.parse(output); // should not throw syntax error
}
