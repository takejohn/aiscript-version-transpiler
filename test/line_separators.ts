import { dedent } from 'ts-dedent';
import { transpileAndValidate } from './test_utils.ts';

Deno.test('if', async (t) => {
	await t.step('between if and cond', () => {
		const script = dedent`
			if
			true 1
		`;
		const expect = dedent`
			if true 1
		`;
		transpileAndValidate(script, expect);
	});

	await t.step('between cond and then', () => {
		const script = dedent`
			if true
			1
		`;
		const expect = dedent`
			if true 1
		`;
		transpileAndValidate(script, expect);
	});

	await t.step('between then and elif', () => {
		const script = dedent`
			if true 1
			elif false 0
		`;
		transpileAndValidate(script, script);
	});

	await t.step('between elif and cond', () => {
		const script = dedent`
			if true 1
			elif
			false 0
		`;
		const expect = dedent`
			if true 1
			elif false 0
		`;
		transpileAndValidate(script, expect);
	});

	await t.step('between cond and then of elseif', () => {
		const script = dedent`
			if true 1
			elif false
			0
		`;
		const expect = dedent`
			if true 1
			elif false 0
		`;
		transpileAndValidate(script, expect);
	});

	await t.step('between else and then', async (t) => {
		await t.step('no elif', () => {
			const script = dedent`
				if true 1
				else 0
			`;
			transpileAndValidate(script, script);
		});

		await t.step('after elif', () => {
			const script = dedent`
				if true 1
				elif false 2
				else 0
			`;
			transpileAndValidate(script, script);
		});
	});

	await t.step('between else and then', async (t) => {
		await t.step('no elif', () => {
			const script = dedent`
				if true 1
				else
				0
			`;
			const expect = dedent`
				if true 1
				else 0
			`;
			transpileAndValidate(script, expect);
		});

		await t.step('after elif', () => {
			const script = dedent`
				if true 1
				elif false 2
				else
				0
			`;
			const expect = dedent`
				if true 1
				elif false 2
				else 0
			`;
			transpileAndValidate(script, expect);
		});
	});
});
