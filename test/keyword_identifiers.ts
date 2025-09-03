import { assertThrows } from '@std/assert';

import { transpile } from '../src/main.ts';
import { errors as errors_0_19_0 } from 'aiscript@0.19.0';
import { transpileAndValidate } from './test_utils.ts';

Deno.test('conventional keywords', async (t) => {
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
	for (const [keyword] of cases) {
		await t.step(keyword, () => {
			assertThrows(
				() => transpile(`let ${keyword} = 1`),
				errors_0_19_0.AiScriptError,
			);
		});
	}
});

Deno.test('identifiers', async (t) => {
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
	for (const [keyword, identifier] of cases) {
		await t.step(keyword, async (t) => {
			await t.step('variable', () => {
				transpileAndValidate(keyword, identifier);
			});
		});
	}
});
