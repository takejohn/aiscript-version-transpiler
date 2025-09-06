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
	const usedKeywordCases: readonly [string, string][] = [
		['case', 'case_'],
		['default', 'default_'],
		['do', 'do_'],
		['__AVT', '__AVT_'],
	];

	const unusedKeywordCases: readonly [string, string][] = [
		['as', 'as_'],
		['async', 'async_'],
		['await', 'await_'],
		['catch', 'catch_'],
		['component', 'component_'],
		['constructor', 'constructor_'],
		['dictionary', 'dictionary_'],
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
	];

	const notKeywordCases: readonly [string, string][] = [
		['_', '_'],
		['__', '__'],
		['foo_', 'foo_'],
		['case_', 'case__'],
	];

	const identifierCases: readonly [string, string][] = [
		...usedKeywordCases,
		...unusedKeywordCases,
		...notKeywordCases,
	];

	const scriptCases: readonly [string, (identifier: string) => string][] = [
		['reference', (identifier: string) => identifier],
		['immutable variable', (identifier: string) => `let ${identifier} = 0`],
		['mutable variable', (identifier: string) => `var ${identifier} = 0`],
		['function name', (identifier: string) => `@${identifier}() {}`],
		['namespace', (identifier: string) => `:: ${identifier} { let a = 0 }`],
		['namespace reference', (identifier: string) => `${identifier}:a`],
		['namespace member reference', (identifier: string) => `Ns:${identifier}`],
		['metadata name', (identifier: string) => `### ${identifier} {}`],
		['for variable', (identifier: string) => `for let ${identifier}, 4 {}`],
		['each variable', (identifier: string) => `each let ${identifier}, [] {}`],
		['assigned variable', (identifier: string) => `${identifier} = 0`],
		['add-assigned variable', (identifier: string) => `${identifier} += 0`],
		['sub-assigned variable', (identifier: string) => `${identifier} -= 0`],
	];

	const cases = identifierCases.flatMap(
		(identifierCase) => scriptCases.map(
			(scriptCase) => [...identifierCase, ...scriptCase] as const,
		),
	);

	if (identifierCases.length * scriptCases.length !== cases.length) {
		throw Error(`${identifierCases.length} * ${scriptCases.length} != ${cases.length}`);
	}

	test.each(cases)('$0 as $2', (identifier, expectedIdentifier, _useCase, builder) => {
		const script = builder(identifier);
		const expected = builder(expectedIdentifier);
		transpileAndValidate(script, expected);
	});

	test.each(usedKeywordCases)('$0 as object key', (identifier) => {
		const script = `{ ${identifier}: 0 }`;
		transpileAndValidate(script, script);
	});

	test.each(unusedKeywordCases)('$0 as object key', (identifier) => {
		const script = `{ ${identifier}: 0 }`;
		const expected = `eval{let __AVT={}; __AVT["${identifier}"]= 0; __AVT}`;
		transpileAndValidate(script, expected);
	});

	test.each(notKeywordCases)('$0 as object key', (identifier) => {
		const script = `{ ${identifier}: 0 }`;
		transpileAndValidate(script, script);
	});
});
