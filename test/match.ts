import { dedent } from 'ts-dedent';
import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils';

test('case', () => {
	const script = dedent`
		match 0 {
			1 => 2
		}
	`;
	const expected = dedent`
		match 0 {
			case 1 => 2
		}
	`;
	transpileAndValidate(script, expected);
});

test('default', () => {
	const script = dedent`
		match 0 {
			1 => 2
			* => 3
		}
	`;
	const expected = dedent`
		match 0 {
			case 1 => 2
			default => 3
		}
	`;
	transpileAndValidate(script, expected);
});

test('separator between cases', () => {
	const script = dedent`
		match 0 { 1 => 2 3 => 4 }
	`;
	const expected = dedent`
		match 0 { case 1 => 2, case 3 => 4 }
	`;
	transpileAndValidate(script, expected);
});

test('separator between case and default', () => {
	const script = dedent`
		match 0 { 1 => 2 * => 3 }
	`;
	const expected = dedent`
		match 0 { case 1 => 2, default => 3 }
	`;
	transpileAndValidate(script, expected);
});

test('line separator between match and about', () => {
	const script = dedent`
		match
		0 {
			1 => 2
		}
	`;
	const expected = dedent`
		match 0 {
			case 1 => 2
		}
	`;
	transpileAndValidate(script, expected);
});

test('line separator between about and body', () => {
	const script = dedent`
		match 0
		{
			1 => 2
		}
	`;
	const expected = dedent`
		match 0 {
			case 1 => 2
		}
	`;
	transpileAndValidate(script, expected);
});

describe('obj as right hand of arm', () => {
	describe('without parentheses', () => {
		test('case', () => {
			const script = dedent`
				match 0 {
					1 => { key: "value" }
				}
			`;
			const expected = dedent`
				match 0 {
					case 1 => ({ key: "value" })
				}
			`;
			transpileAndValidate(script, expected);
		});

		test('default', () => {
			const script = dedent`
				match 0 {
					1 => 2
					* => { key: "value" }
				}
			`;
			const expected = dedent`
				match 0 {
					case 1 => 2
					default => ({ key: "value" })
				}
			`;
			transpileAndValidate(script, expected);
		});
	});

	describe('with parentheses', () => {
		test('case', () => {
			const script = dedent`
				match 0 {
					1 => ({ key: "value" })
				}
			`;
			const expected = dedent`
				match 0 {
					case 1 => ({ key: "value" })
				}
			`;
			transpileAndValidate(script, expected);
		});

		test('default', () => {
			const script = dedent`
				match 0 {
					1 => 2
					* => ({ key: "value" })
				}
			`;
			const expected = dedent`
				match 0 {
					case 1 => 2
					default => ({ key: "value" })
				}
			`;
			transpileAndValidate(script, expected);
		});
	});
});
