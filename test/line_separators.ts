import { dedent } from 'ts-dedent';
import { transpileAndValidate } from './test_utils.js';
import { describe, test } from 'vitest';

describe('namespace', () => {
	test('between :: and name', () => {
		const script = dedent`
			::
			Ns {
				let a = 0
			}
		`;
		const expected = dedent`
			:: Ns {
				let a = 0
			}
		`;
		transpileAndValidate(script, expected);
	});

	test('between name and body', () => {
		const script = dedent`
			:: Ns
			{
				let a = 0
			}
		`;
		const expected = dedent`
		:: Ns {
			let a = 0
		}
		`;
		transpileAndValidate(script, expected);
	});
});

test('meta', () => {
	const script = dedent`
		### Meta
		{
		}
	`;
	const expected = dedent`
		### Meta {
		}
	`;
	transpileAndValidate(script, expected);
});

describe('if', () => {
	test('between if and cond', () => {
		const script = dedent`
			if
			true 1
		`;
		const expected = dedent`
			if true 1
		`;
		transpileAndValidate(script, expected);
	});

	test('between cond and then', () => {
		const script = dedent`
			if true
			1
		`;
		const expected = dedent`
			if true 1
		`;
		transpileAndValidate(script, expected);
	});

	test('between then and elif', () => {
		const script = dedent`
			if true 1
			elif false 0
		`;
		transpileAndValidate(script, script);
	});

	test('between elif and cond', () => {
		const script = dedent`
			if true 1
			elif
			false 0
		`;
		const expected = dedent`
			if true 1
			elif false 0
		`;
		transpileAndValidate(script, expected);
	});

	test('between cond and then of elseif', () => {
		const script = dedent`
			if true 1
			elif false
			0
		`;
		const expected = dedent`
			if true 1
			elif false 0
		`;
		transpileAndValidate(script, expected);
	});

	describe('between else and then', () => {
		test('no elif', () => {
			const script = dedent`
				if true 1
				else 0
			`;
			transpileAndValidate(script, script);
		});

		test('after elif', () => {
			const script = dedent`
				if true 1
				elif false 2
				else 0
			`;
			transpileAndValidate(script, script);
		});
	});

	describe('between else and then', () => {
		test('no elif', () => {
			const script = dedent`
				if true 1
				else
				0
			`;
			const expected = dedent`
				if true 1
				else 0
			`;
			transpileAndValidate(script, expected);
		});

		test('after elif', () => {
			const script = dedent`
				if true 1
				elif false 2
				else
				0
			`;
			const expected = dedent`
				if true 1
				elif false 2
				else 0
			`;
			transpileAndValidate(script, expected);
		});
	});

	test('indented', () => {
		const script = dedent`
			if true
				1
			else
				0
		`;
		const expected = dedent`
			if true 1
			else 0
		`;
		transpileAndValidate(script, expected);
	});

	test('indented multiple elif', () => {
		const script = dedent`
			if (a == 1)
				1
			elif (a == 2)
				2
			elif (a == 3)
				3
		`;
		const expected = dedent`
			if (a == 1) 1
			elif (a == 2) 2
			elif (a == 3) 3
		`;
		transpileAndValidate(script, expected);
	});
});

describe('fn', () => {
	describe('between arguments and body', () => {
		test('with name', () => {
			const script = dedent`
				@f()
				{
				}
			`;
			const expected = dedent`
				@f() {
				}
			`;
			transpileAndValidate(script, expected);
		});

		test('without name', () => {
			const script = dedent`
				@()
				{
				}
			`;
			const expected = dedent`
				@() {
				}
			`;
			transpileAndValidate(script, expected);
		});
	});
});

test('return', () => {
	const script = dedent`
		@() {
			return
			0
		}
	`;
	const expected = dedent`
		@() {
			return 0
		}
	`;
	transpileAndValidate(script, expected);
});

test('exists', () => {
	const script = dedent`
		exists
		x
	`;
	const expected = dedent`
		exists x
	`;
	transpileAndValidate(script, expected);
});

describe('obj', () => {
	test('between key and colon', () => {
		const script = dedent`
			{
				a:
				0
			}
		`;
		const expected = dedent`
			{
				a: 0
			}
		`;
		transpileAndValidate(script, expected);
	});

	test('between colon and value', () => {
		const script = dedent`
			{
				a
				: 0
			}
		`;
		const expected = dedent`
			{
				a : 0
			}
		`;
		transpileAndValidate(script, expected);
	});
});

describe('for', () => {
	describe('times', () => {
		test('between for and times', () => {
			const script = dedent`
				for
				4 {}
			`;
			const expected = dedent`
				for 4 {}
			`;
			transpileAndValidate(script, expected);
		});

		test('between for and times with parentheses', () => {
			const script = dedent`
				for
				(4) {}
			`;
			const expected = dedent`
				for (4) {}
			`;
			transpileAndValidate(script, expected);
		});

		test('between times and body', () => {
			const script = dedent`
				for 4
				{}
			`;
			const expected = dedent`
				for 4 {}
			`;
			transpileAndValidate(script, expected);
		});

		test('between times with parentheses and body', () => {
			const script = dedent`
				for (4)
				{}
			`;
			const expected = dedent`
				for (4) {}
			`;
			transpileAndValidate(script, expected);
		});
	});

	describe('range', () => {
		describe('without from', () => {
			test('between variable and equal', () => {
				const script = dedent`
					for let i
					= 0, 4 {}
				`;
				const expected = dedent`
					for let i = 0, 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between variable and equal with parentheses', () => {
				const script = dedent`
					for (let i
					= 0, 4) {}
				`;
				const expected = dedent`
					for (let i = 0, 4) {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between equal and expression', () => {
				const script = dedent`
					for let i =
					0, 4 {}
				`;
				const expected = dedent`
					for let i = 0, 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between equal and expression with parentheses', () => {
				const script = dedent`
					for (let i =
					0, 4) {}
				`;
				const expected = dedent`
					for (let i = 0, 4) {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between comma and to', () => {
				const script = dedent`
					for let i = 0,
					4 {}
				`;
				const expected = dedent`
					for let i = 0, 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between comma and to with parentheses', () => {
				const script = dedent`
					for (let i = 0,
					4) {}
				`;
				const expected = dedent`
					for (let i = 0, 4) {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between from and to', () => {
				const script = dedent`
					for let i = 0
					4 {}
				`;
				const expected = dedent`
					for let i = 0, 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between from and to with parentheses', () => {
				const script = dedent`
					for (let i = 0
					4) {}
				`;
				const expected = dedent`
					for (let i = 0, 4) {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between range and body', () => {
				const script = dedent`
					for let i = 0, 4
					{}
				`;
				const expected = dedent`
					for let i = 0, 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between range with parentheses and body', () => {
				const script = dedent`
					for (let i = 0, 4)
					{}
				`;
				const expected = dedent`
					for (let i = 0, 4) {}
				`;
				transpileAndValidate(script, expected);
			});
		});

		describe('with from', () => {
			test('between for and range', () => {
				const script = dedent`
					for
					let i, 4 {}
				`;
				const expected = dedent`
					for let i, 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between for and range with parentheses', () => {
				const script = dedent`
					for
					(let i, 4) {}
				`;
				const expected = dedent`
					for (let i, 4) {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between let and variable', () => {
				const script = dedent`
					for let
					i, 4 {}
				`;
				const expected = dedent`
					for let i, 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between let and variable with parentheses', () => {
				const script = dedent`
					for (let
					i, 4) {}
				`;
				const expected = dedent`
					for (let i, 4) {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between variable and comma', () => {
				const script = dedent`
					for let i
					, 4 {}
				`;
				const expected = dedent`
					for let i , 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between variable and comma with parentheses', () => {
				const script = dedent`
					for (let i
					, 4) {}
				`;
				const expected = dedent`
					for (let i , 4) {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between variable and to', () => {
				const script = dedent`
					for let i
					4 {}
				`;
				const expected = dedent`
					for let i, 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between variable and to with parentheses', () => {
				const script = dedent`
					for (let i
					4) {}
				`;
				const expected = dedent`
					for (let i, 4) {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between comma and to', () => {
				const script = dedent`
					for let i,
					4 {}
				`;
				const expected = dedent`
					for let i, 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between comma and to with parentheses', () => {
				const script = dedent`
					for (let i,
					4) {}
				`;
				const expected = dedent`
					for (let i, 4) {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between range and body', () => {
				const script = dedent`
					for let i, 4
					{}
				`;
				const expected = dedent`
					for let i, 4 {}
				`;
				transpileAndValidate(script, expected);
			});

			test('between range with parentheses and body', () => {
				const script = dedent`
					for (let i, 4)
					{}
				`;
				const expected = dedent`
					for (let i, 4) {}
				`;
				transpileAndValidate(script, expected);
			});
		});
	});
});

describe('each', () => {
	test('between each and let', () => {
		const script = dedent`
			each
			let e, [] {}
		`;
		const expected = dedent`
			each let e, [] {}
		`;
		transpileAndValidate(script, expected);
	});

	test('between each and let with parentheses', () => {
		const script = dedent`
			each
			(let e, []) {}
		`;
		const expected = dedent`
			each (let e, []) {}
		`;
		transpileAndValidate(script, expected);
	});

	test('between let and variable', () => {
		const script = dedent`
			each let
			e, [] {}
		`;
		const expected = dedent`
			each let e, [] {}
		`;
		transpileAndValidate(script, expected);
	});

	test('between let and variable with parentheses', () => {
		const script = dedent`
			each (let
			e, []) {}
		`;
		const expected = dedent`
			each (let e, []) {}
		`;
		transpileAndValidate(script, expected);
	});

	test('between variable and comma', () => {
		const script = dedent`
			each let e
			, [] {}
		`;
		const expected = dedent`
			each let e , [] {}
		`;
		transpileAndValidate(script, expected);
	});

	test('between variable and comma with parentheses', () => {
		const script = dedent`
			each (let e
			, []) {}
		`;
		const expected = dedent`
			each (let e , []) {}
		`;
		transpileAndValidate(script, expected);
	});

	test('between variable and items', () => {
		const script = dedent`
			each let e
			[] {}
		`;
		const expected = dedent`
			each let e, [] {}
		`;
		transpileAndValidate(script, expected);
	});

	test('between comma and items', () => {
		const script = dedent`
			each let e,
			[] {}
		`;
		const expected = dedent`
			each let e, [] {}
		`;
		transpileAndValidate(script, expected);
	});

	test('between comma and items with parentheses', () => {
		const script = dedent`
			each (let e,
			[]) {}
		`;
		const expected = dedent`
			each (let e, []) {}
		`;
		transpileAndValidate(script, expected);
	});

	test('between items and body', () => {
		const script = dedent`
			each let e, []
			{}
		`;
		const expected = dedent`
			each let e, [] {}
		`;
		transpileAndValidate(script, expected);
	});

	test('between items with parentheses and body', () => {
		const script = dedent`
			each (let e, [])
			{}
		`;
		const expected = dedent`
			each (let e, []) {}
		`;
		transpileAndValidate(script, expected);
	});
});

test('loop', () => {
	const script = dedent`
		loop
		{
			break
		}
	`;
	const expected = dedent`
		loop {
			break
		}
	`;
	transpileAndValidate(script, expected);
});

describe('comments between', () => {
	test('block comment', () => {
		const script = dedent`
			if true /* comment */
			1
		`;
		const expected = dedent`
			if true /* comment */ 1
		`;
		transpileAndValidate(script, expected);
	});

	test('block comment with line separator', () => {
		const script = dedent`
			if true /* comment
			more comment */ 1
		`;
		transpileAndValidate(script, script);
	});

	test('line comment', () => {
		const script = dedent`
			if true // comment
			1
		`;
		const expected = dedent`
			if true /* comment
			*/ 1
		`;
		transpileAndValidate(script, expected);
	});
});
