import type { Ast } from 'aiscript.0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { replaceLineSeparators, strictIndexOf } from '../utils.js';

export function replaceAssign(node: Ast.Assign | Ast.AddAssign | Ast.SubAssign, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const destLoc = getActualLocation(node.dest, script, true);
	const exprLoc = getActualLocation(node.expr, script, true);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	builder.addNodeReplacement(node.dest, ancestors);

	const operator = toOperatorString(node);
	const equalStart = strictIndexOf(script, operator, destLoc.end + 1);
	builder.addReplacement(destLoc.end + 1, equalStart, replaceLineSeparators);

	const equalEnd = equalStart + operator.length;
	builder.addReplacement(equalEnd, exprLoc.start, replaceLineSeparators);

	builder.addNodeReplacement(node.expr, ancestors);

	return builder.execute();
}

function toOperatorString(node: Ast.Assign | Ast.AddAssign | Ast.SubAssign): string {
	switch (node.type) {
		case 'assign': {
			return '=';
		}
		case 'addAssign': {
			return '+=';
		}
		case 'subAssign': {
			return '-=';
		}
	}
}
