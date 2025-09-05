import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { replaceLineSeparators, strictIndexOf } from '../utils.js';

const EQUAL_SIGN = '=';

export function replaceAssign(node: Ast.Assign | Ast.AddAssign | Ast.SubAssign, script: string): string {
	const loc = getActualLocation(node, script);
	const destLoc = getActualLocation(node.dest, script, true);
	const exprLoc = getActualLocation(node.expr, script, true);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	builder.addNodeReplacement(node.dest);

	const equalStart = strictIndexOf(script, EQUAL_SIGN, destLoc.end + 1);
	builder.addReplacement(destLoc.end + 1, equalStart, replaceLineSeparators);

	const equalEnd = equalStart + EQUAL_SIGN.length;
	builder.addReplacement(equalEnd, exprLoc.start, replaceLineSeparators);

	builder.addNodeReplacement(node.expr);

	return builder.execute();
}
