import { transpile } from '../src/main.js';
import { transpileAndValidate } from './test_utils.js';
import { describe, expect, test } from 'vitest';

describe('conventional keywords', () => {
	const cases = [
		['null'],
		['true'],
		['false'],
		['each'],
		['for'],
		['loop'],
		['break'],
		['continue'],
		['match'],
		['if'],
		['elif'],
		['else'],
		['return'],
		['eval'],
		['var'],
		['let'],
		['exists'],
		['attr'],
		['attribute'],
		['class'],
		['export'],
		['fn'],
		['static'],
		['struct'],
		['while'],
		['import'],
		['meta'],
		['module'],
		['namespace'],
	];
	test.each(cases)('%s', (keyword) => {
		expect(
			() => transpile(`let ${keyword} = 1`),
		).toThrow();
	});
});

describe('identifiers', () => {
	const cases = [
		// new keywords
		['case', 'case_'],
		['default', 'default_'],
		['as', 'as_'],
		['async', 'async_'],
		['await', 'await_'],
		['catch', 'catch_'],
		['component', 'component_'],
		['constructor', 'constructor_'],
		['dictionary', 'dictionary_'],
		['do', 'do_'],
		['enum', 'enum_'],
		['finally', 'finally_'],
		['hash', 'hash_'],
		['in', 'in_'],
		['interface', 'interface_'],
		['out', 'out_'],
		['private', 'private_'],
		['public', 'public_'],
		['ref', 'ref_'],
		['table', 'table_'],
		['this', 'this_'],
		['throw', 'throw_'],
		['trait', 'trait_'],
		['try', 'try_'],
		['undefined', 'undefined_'],
		['use', 'use_'],
		['using', 'using_'],
		['when', 'when_'],
		['yield', 'yield_'],
		['is', 'is_'],
		['new', 'new_'],

		// not keywords
		['_', '_'],
		['__', '__'],
		['foo_', 'foo_'],
		['case_', 'case__'],
	];

	test.each(cases)('%s as reference', (keyword, identifier) => {
		transpileAndValidate(keyword, identifier);
	});

	test.each(cases)('%s as immutable variable', (keyword, identifier) => {
		const script = `let ${keyword} = 0`;
		const expected = `let ${identifier} = 0`;
		transpileAndValidate(script, expected);
	});

	test.each(cases)('%s as mutable variable', (keyword, identifier) => {
		const script = `var ${keyword} = 0`;
		const expected = `var ${identifier} = 0`;
		transpileAndValidate(script, expected);
	});

	test.each(cases)('%s as function name', (keyword, identifier) => {
		const script = `@${keyword}() {}`;
		const expected = `@${identifier}() {}`;
		transpileAndValidate(script, expected);
	});

	test.each(cases)('%s as namespace', (keyword, identifier) => {
		const script = `:: ${keyword} { let a = 0 }`;
		const expected = `:: ${identifier} { let a = 0 }`;
		transpileAndValidate(script, expected);
	});

	test.each(cases)('%s as namespace reference', (keyword, identifier) => {
		const script = `${keyword}:a`;
		const expected = `${identifier}:a`;
		transpileAndValidate(script, expected);
	});

	test.each(cases)('%s as namespace member reference', (keyword, identifier) => {
		const script = `Ns:${keyword}`;
		const expected = `Ns:${identifier}`;
		transpileAndValidate(script, expected);
	});

	test.each(cases)('%s as metadata name', (keyword, identifier) => {
		const script = `### ${keyword} {}`;
		const expected = `### ${identifier} {}`;
		transpileAndValidate(script, expected);
	});
});
