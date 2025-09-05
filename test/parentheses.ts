import dedent from 'ts-dedent';
import { describe, test } from 'vitest';
import { transpileAndValidate } from './test_utils';

test('single', () => {
	const script = dedent`
		(
			0
		)
	`;
	const expected = dedent`
		( 0 )
	`;
	transpileAndValidate(script, expected);
});

describe('assign', () => {
	test('dest', () => {
		const script = dedent`
			(
				x
			) = 0
		`;
		const expected = dedent`
			( x ) = 0
		`;
		transpileAndValidate(script, expected);
	});

	test('expr', () => {
		const script = dedent`
			x = (
				0
			)
		`;
		const expected = dedent`
			x = ( 0 )
		`;
		transpileAndValidate(script, expected);
	});
});

describe('and', () => {
	test('left', () => {
		const script = dedent`
			(
				true
			) && false
		`;
		const expected = dedent`
			( true ) && false
		`;
		transpileAndValidate(script, expected);
	});

	test('right', () => {
		const script = dedent`
			true && (
				false
			)
		`;
		const expected = dedent`
			true && ( false )
		`;
		transpileAndValidate(script, expected);
	});
});

describe('or', () => {
	test('left', () => {
		const script = dedent`
			(
				true
			) || false
		`;
		const expected = dedent`
			( true ) || false
		`;
		transpileAndValidate(script, expected);
	});

	test('right', () => {
		const script = dedent`
			true || (
				false
			)
		`;
		const expected = dedent`
			true || ( false )
		`;
		transpileAndValidate(script, expected);
	});
});

test('block', () => {
	const script = dedent`
		eval {
			(
				0
			)
		}
	`;
	const expected = dedent`
		eval {
			( 0 )
		}
	`;
	transpileAndValidate(script, expected);
});

describe('call', () => {
	test('target', () => {
		const script = dedent`
			(
				f
			)()
		`;
		const expected = dedent`
			( f )()
		`;
		transpileAndValidate(script, expected);
	});

	test('single argument', () => {
		const script = dedent`
			f((
				0
			))
		`;
		const expected = dedent`
			f(( 0 ))
		`;
		transpileAndValidate(script, expected);
	});

	test('second argument', () => {
		const script = dedent`
			f(1, (
				2
			))
		`;
		const expected = dedent`
			f(1, ( 2 ))
		`;
		transpileAndValidate(script, expected);
	});

	test('print', () => {
		const script = dedent`
			<: (
				0
			)
		`;
		const expected = dedent`
			<: ( 0 )
		`;
		transpileAndValidate(script, expected);
	});

	test('operator left', () => {
		const script = dedent`
			(
				1
			) + 2
		`;
		const expected = dedent`
			( 1 ) + 2
		`;
		transpileAndValidate(script, expected);
	});

	test('operator right', () => {
		const script = dedent`
			1 + (
				2
			)
		`;
		const expected = dedent`
			1 + ( 2 )
		`;
		transpileAndValidate(script, expected);
	});

	test('operator left without whitespace', () => {
		const script = '(1)+2';
		transpileAndValidate(script, script);
	});

	test('operator right without whitespace', () => {
		const script = '1+(2)';
		transpileAndValidate(script, script);
	});

	test('operator left and right without whitespace', () => {
		const script = '(1)+(2)';
		transpileAndValidate(script, script);
	});
});

describe('definition', () => {
	describe('variable', () => {
		test('immutable', () => {
			const script = dedent`
				let x = (
					0
				)
			`;
			const expected = dedent`
				let x = ( 0 )
			`;
			transpileAndValidate(script, expected);
		});

		test('mutable', () => {
			const script = dedent`
				var x = (
					0
				)
			`;
			const expected = dedent`
				var x = ( 0 )
			`;
			transpileAndValidate(script, expected);
		});
	});

	test('function', () => {
		const script = dedent`
			@f() {
				(
					0
				)
			}
		`;
		const expected = dedent`
			@f() {
				( 0 )
			}
		`;
		transpileAndValidate(script, expected);
	});
});

describe('each', () => {
	test('items', () => {
		const script = dedent`
			each let e, (
				[]
			) {}
		`;
		const expected = dedent`
			each let e, ( [] ) {}
		`;
		transpileAndValidate(script, expected);
	});

	test('for', () => {
		const script = dedent`
			each let e, [] {
				(
					0
				)
			}
		`;
		const expected = dedent`
			each let e, [] {
				( 0 )
			}
		`;
		transpileAndValidate(script, expected);
	});
});

test('fn', () => {
	const script = dedent`
		@() {
			(
				0
			)
		}
	`;
	const expected = dedent`
		@() {
			( 0 )
		}
	`;
	transpileAndValidate(script, expected);
});

describe('for', () => {
	describe('times', () => {
		test('times', () => {
			const script = dedent`
				for (
					0
				) {}
			`;
			const expected = dedent`
				for ( 0 ) {}
			`;
			transpileAndValidate(script, expected);
		});

		test('for', () => {
			const script = dedent`
				for 0 {
					(
						0
					)
				}
			`;
			const expected = dedent`
				for 0 {
					( 0 )
				}
			`;
			transpileAndValidate(script, expected);
		});
	});

	describe('range', () => {
		test('from', () => {
			const script = dedent`
				for let i = (
					0
				), 1 {}
			`;
			const expected = dedent`
				for let i = ( 0 ), 1 {}
			`;
			transpileAndValidate(script, expected);
		});

		test('to', () => {
			const script = dedent`
				for let i = 0, (
					1
				) {}
			`;
			const expected = dedent`
				for let i = 0, ( 1 ) {}
			`;
			transpileAndValidate(script, expected);
		});

		test('for', () => {
			const script = dedent`
				for let i = 0, 1 {
					(
						0
					)
				}
			`;
			const expected = dedent`
				for let i = 0, 1 {
					( 0 )
				}
			`;
			transpileAndValidate(script, expected);
		});
	});
});

describe('if', () => {
	test('cond', () => {
		const script = dedent`
			if (
				true
			) {}
		`;
		const expected = dedent`
			if ( true ) {}
		`;
		transpileAndValidate(script, expected);
	});

	test('then', () => {
		const script = dedent`
			if true {
				(
					0
				)
			}
		`;
		const expected = dedent`
			if true {
				( 0 )
			}
		`;
		transpileAndValidate(script, expected);
	});

	test('elseif cond', () => {
		const script = dedent`
			if true {
			} elif (
			 	false
			) {}
		`;
		const expected = dedent`
			if true {
			} elif ( false ) {}
		`;
		transpileAndValidate(script, expected);
	});

	test('elseif then', () => {
		const script = dedent`
			if true {
			} elif false {
				(
					0
				)
			}
		`;
		const expected = dedent`
			if true {
			} elif false {
				( 0 )
			}
		`;
		transpileAndValidate(script, expected);
	});

	test('else', () => {
		const script = dedent`
			if true {
			} else {
				(
					0
				)
			}
		`;
		const expected = dedent`
			if true {
			} else {
				( 0 )
			}
		`;
		transpileAndValidate(script, expected);
	});
});

describe('index', () => {
	test('target', () => {
		const script = dedent`
			(
				a
			)[0]
		`;
		const expected = dedent`
			( a )[0]
		`;
		transpileAndValidate(script, expected);
	});

	test('index', () => {
		const script = dedent`
			a[(
				0
			)]
		`;
		const expected = dedent`
			a[( 0 )]
		`;
		transpileAndValidate(script, expected);
	});
});

test('tmpl', () => {
	const script = dedent`
		\`{(
			0
		)}\`
	`;
	const expected = dedent`
		\`{( 0 )}\`
	`;
	transpileAndValidate(script, expected);
});

test('obj', () => {
	const script = dedent`
		{
			p: (
				0
			)
		}
	`;
	const expected = dedent`
		{
			p: ( 0 )
		}
	`;
	transpileAndValidate(script, expected);
});

test('arr', () => {
	const script = dedent`
		[(
			0
		)]
	`;
	const expected = dedent`
		[( 0 )]
	`;
	transpileAndValidate(script, expected);
});

test('loop', () => {
	const script = dedent`
		loop {
			(
				0
			)
		}
	`;
	const expected = dedent`
		loop {
			( 0 )
		}
	`;
	transpileAndValidate(script, expected);
});

describe('match', () => {
	test('about', () => {
		const script = dedent`
			match (
				0
			) {
				1 => 2
			}
		`;
		const expected = dedent`
			match ( 0 ) {
				case 1 => 2
			}
		`;
		transpileAndValidate(script, expected);
	});

	test('q', () => {
		const script = dedent`
			match 0 {
				(
					1
				) => 2
			}
		`;
		const expected = dedent`
			match 0 {
				case ( 1 ) => 2
			}
		`;
		transpileAndValidate(script, expected);
	});

	test('a', () => {
		const script = dedent`
			match 0 {
				1 => (
					2
				)
			}
		`;
		const expected = dedent`
			match 0 {
				case 1 => ( 2 )
			}
		`;
		transpileAndValidate(script, expected);
	});

	test('default', () => {
		const script = dedent`
			match 0 {
				1 => 2
				* => (
					3
				)
			}
		`;
		const expected = dedent`
			match 0 {
				case 1 => 2
				default => ( 3 )
			}
		`;
		transpileAndValidate(script, expected);
	});
});

test('not', () => {
	const script = dedent`
		!(
			true
		)
	`;
	const expected = dedent`
		!( true )
	`;
	transpileAndValidate(script, expected);
});

test('prop', () => {
	const script = dedent`
		(
			o
		).p
	`;
	const expected = dedent`
		( o ).p
	`;
	transpileAndValidate(script, expected);
});

test('return', () => {
	const script = dedent`
		@() {
			return (
				0
			)
		}
	`;
	const expected = dedent`
		@() {
			return ( 0 )
		}
	`;
	transpileAndValidate(script, expected);
});
