import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { replaceLineSeparators, replaceName, strictIndexOf } from '../utils.js';

const AT_SIGN = '@';
const LEFT_PARENTHESIS = '(';
const RIGHT_PARENTHESIS = ')';
const LEFT_BRACE = '{';

export function replaceFn(node: Ast.Fn, script: string, name?: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	let argsStart: number;
	if (name != null) {
		const nameStart = strictIndexOf(script, name, loc.start + AT_SIGN.length);
		const nameEnd = nameStart + name.length;
		builder.addReplacement(nameStart, nameEnd, replaceName);
		argsStart = strictIndexOf(script, LEFT_PARENTHESIS, nameEnd);
	} else {
		argsStart = strictIndexOf(script, LEFT_PARENTHESIS, loc.start + AT_SIGN.length);
	}
	const argsEnd = getArgsEnd(script, argsStart, loc.end);
	const bodyStart = strictIndexOf(script, LEFT_BRACE, argsEnd + 1);
	builder.addReplacement(argsEnd + 1, bodyStart, replaceLineSeparators);
	builder.addNodeReplacements(node.children);
	return builder.execute();
}

function getArgsEnd(script: string, start: number, end: number): number {
	let depth = 0;
	for (let i = start; i <= end; i++) {
		const char = script[i]!;
		if (char === LEFT_PARENTHESIS) {
			depth++;
		} else if (char === RIGHT_PARENTHESIS) {
			depth--;
		}
		if (depth === 0) {
			return i;
		}
	}
	throw new TypeError('Unterminated argument list');
}
