import { assertEquals } from '@std/assert';
import { transpile } from '../src/main.ts';
import { Parser } from 'aiscript@1.1.0';

export function transpileAndValidate(script: string, expect: string): void {
	const output = transpile(script);
	assertEquals(output, expect);
	Parser.parse(output); // should not throw syntax error
}
