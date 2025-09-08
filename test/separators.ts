import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils';
import dedent from 'ts-dedent';

describe('function arguments', () => {
	describe('function expression', () => {
		test('comma separated', () => {
			const script = '@(a, b, c) {}';
			transpileAndValidate(script, script);
		});

		test('line separated', () => {
			const script = dedent`
				@(
					a
					b
					c
				) {}
			`;
			transpileAndValidate(script, script);
		});

		test('space separated', () => {
			const script = '@(a b c) {}';
			const expected = '@(a, b, c) {}';
			transpileAndValidate(script, expected);
		});

		test('line + comma separated', () => {
			const script = dedent`
				@(
					a
					, b
				) {}
			`;
			const expected = dedent`
				@(
					a , b
				) {}
			`;
			transpileAndValidate(script, expected);
		});
	});

	describe('function definition', () => {
		test('comma separated', () => {
			const script = '@f(a, b, c) {}';
			transpileAndValidate(script, script);
		});

		test('line separated', () => {
			const script = dedent`
				@f(
					a
					b
					c
				) {}
			`;
			transpileAndValidate(script, script);
		});

		test('space separated', () => {
			const script = '@f(a b c) {}';
			const expected = '@f(a, b, c) {}';
			transpileAndValidate(script, expected);
		});

		test('line + comma separated', () => {
			const script = dedent`
				@f(
					a
					, b
				) {}
			`;
			const expected = dedent`
				@f(
					a , b
				) {}
			`;
			transpileAndValidate(script, expected);
		});
	});
});

describe('function type annotation', () => {
	test('comma separated', () => {
		const script = 'var f: @(num, num) => num = null';
		transpileAndValidate(script, script);
	});

	test('line separated', () => {
		const script = dedent`
			var f: @(
				num
				num
			) => num = null
		`;
		const expected = dedent`
			var f: @( num, num ) => num = null
		`;
		transpileAndValidate(script, expected);
	});

	test('space separated', () => {
		const script = 'var f: @(num num) => num = null';
		const expected = 'var f: @(num, num) => num = null';
		transpileAndValidate(script, expected);
	});
});

describe('function call parameters', () => {
	test('line separated, 1 argument', () => {
		const script = dedent`
			f(
				0
			)
		`;
		transpileAndValidate(script, script);
	});

	test('nested call, space separated', () => {
		const script = 'f(g(a 0))';
		const expected = 'f(g(a, 0))';
		transpileAndValidate(script, expected);
	});

	test('enclosing parentheses, space separated', () => {
		const script = '(f(a b))';
		const expected = '(f(a, b))';
		transpileAndValidate(script, expected);
	});

	test('line + comma separated', () => {
		const script = dedent`
			f(
				0
				, 1
			)
		`;
		const expected = dedent`
			f(
				0 , 1
			)
		`;
		transpileAndValidate(script, expected);
	});
});

describe('object', () => {
	test('line + comma separated', () => {
		const script = dedent`
			{
				a: 0
				, b: 1
			}
		`;
		const expected = dedent`
			{
				a: 0 , b: 1
			}
		`;
		transpileAndValidate(script, expected);
	});
});

describe('object with reserved word key', () => {
	test('comma separated', () => {
		const script = '{ a: 0, public: 1, b: 2 }';
		const expected = 'eval{let __AVT={}; __AVT.a= 0; __AVT["public"]= 1; __AVT.b= 2; __AVT}';
		transpileAndValidate(script, expected);
	});

	test('line separated', () => {
		const script = dedent`
			{
				a: 0
				public: 1
				b: 2
			}
		`;
		const expected = dedent`
			eval{let __AVT={};
				__AVT.a= 0
				__AVT["public"]= 1
				__AVT.b= 2
			__AVT}
		`;
		transpileAndValidate(script, expected);
	});

	test('comma + line separated', () => {
		const script = dedent`
			{
				a: 0,
				public: 1,
				b: 2,
			}
		`;
		const expected = dedent`
			eval{let __AVT={};
				__AVT.a= 0;
				__AVT["public"]= 1;
				__AVT.b= 2;
			__AVT}
		`;
		transpileAndValidate(script, expected);
	});

	test('space separated', () => {
		const script = '{ a: 0 public: 1 b: 2 }';
		const expected = 'eval{let __AVT={}; __AVT.a= 0; __AVT["public"]= 1; __AVT.b= 2; __AVT}';
		transpileAndValidate(script, expected);
	});

	test('semicolon + line separated', () => {
		const script = dedent`
			{
				a: 0;
				public: 1;
				b: 2;
			}
		`;
		const expected = dedent`
			eval{let __AVT={};
				__AVT.a= 0;
				__AVT["public"]= 1;
				__AVT.b= 2;
			__AVT}
		`;
		transpileAndValidate(script, expected);
	});

	test('semicolon separated', () => {
		const script = '{ a: 0; public: 1; b: 2 }';
		const expected = 'eval{let __AVT={}; __AVT.a= 0; __AVT["public"]= 1; __AVT.b= 2; __AVT}';
		transpileAndValidate(script, expected);
	});

	test('line separated with comments', () => {
		const script = dedent`
			{
				a: 0 // ,
				public: 1 /* , */
				b: 2
			}
		`;
		const expected = dedent`
			eval{let __AVT={};
				__AVT.a= 0 // ,
				__AVT["public"]= 1 /* , */
				__AVT.b= 2
			__AVT}
		`;
		transpileAndValidate(script, expected);
	});

	test('line + comma separated', () => {
		const script = dedent`
			{
				a: 0
				, public: 1
				, b: 2
			}
		`;
		const expected = dedent`
			eval{let __AVT={};
				__AVT.a= 0
				; __AVT["public"]= 1
				; __AVT.b= 2
			__AVT}
		`;
		transpileAndValidate(script, expected);
	});
});

describe('arr', () => {
	test('line + comma separated', () => {
		const script = dedent`
			[
				0
				, 1
			]
		`;
		const expected = dedent`
			[
				0 , 1
			]
		`;
		transpileAndValidate(script, expected);
	});
});

describe('fn type', () => {
	test('line + comma separated', () => {
		const script = dedent`
			let f: @(num
			, num) => num = null
		`;
		const expected = dedent`
			let f: @(num , num) => num = null
		`;
		transpileAndValidate(script, expected);
	});
});

describe('line comment between', () => {
	test('call', () => {
		const script = dedent`
			f(
				0 // zero
				1 // one
				2 // two
			)
		`;
		transpileAndValidate(script, script);
	});

	test('call, with commas after', () => {
		const script = dedent`
			f(
				0 // zero
				, 1 // , one
				, 2 // , two
			)
		`;
		const expected = dedent`
			f(
				0 /* zero
			*/ 	, 1 /* , one
			*/ 	, 2 // , two
			)
		`;
		transpileAndValidate(script, expected);
	});

	test('obj', () => {
		const script = dedent`
			{
				a: 0 // zero
				b: 1 // one
				c: 2 // two
			}
		`;
		transpileAndValidate(script, script);
	});

	test('arr', () => {
		const script = dedent`
			[
				0 // zero
				1 // one
				2 // two
			]
		`;
		transpileAndValidate(script, script);
	});

	test('match', () => {
		const script = dedent`
			match 0 {
				1 => 2 // case
				* => 3 // default
			}
		`;
		const expected = dedent`
			match 0 {
				case 1 => 2 // case
				default => 3 // default
			}
		`;
		transpileAndValidate(script, expected);
	});
});
