import { expect } from 'vitest';
import { transpile } from '../src/main.js';
import { Parser } from 'aiscript@1.1.0';

export function transpileAndValidate(script: string, expected: string): void {
	const output = transpile(script);
	expect(output).toBe(expected);
	Parser.parse(output); // should not throw syntax error
}

export function requireType<T extends { type: string }, U extends T['type']>(value: T, type: U): T & { type: U } {
	if (value.type !== type) {
		throw new TypeError(`Unexpected type (actual: ${value.type}, expected: ${type})`);
	}
	return value as T & { type: U };
}
