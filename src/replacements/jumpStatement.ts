import type { Ast } from 'aiscript.0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { replaceLineSeparators } from '../utils.js';

const RETURN_KEYWORD = 'return';

export function replaceBreak(ancestors: Ast.Node[]): string {
	if (hasBreakableAncestor(ancestors)) {
		return 'break';
	}
	return 'Core:abort("")';
}

export function replaceContinue(ancestors: Ast.Node[]): string {
	if (hasBreakableAncestor(ancestors)) {
		return 'continue';
	}
	return 'Core:abort("")';
}

function hasBreakableAncestor(ancestors: Ast.Node[]): boolean {
	for (const { type } of ancestors) {
		if (type === 'loop' || type === 'for' || type === 'each') {
			return true;
		}
		if (type === 'fn') {
			return false;
		}
	}
	return false;
}

export function replaceReturn(node: Ast.Return, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	const exprLoc = getActualLocation(node.expr, script, true);

	if (ancestors.some(({ type }) => type === 'fn')) {
		builder.addReplacement(loc.start + RETURN_KEYWORD.length, exprLoc.start, replaceLineSeparators);
	} else {
		builder.addReplacement(loc.start, loc.start + RETURN_KEYWORD.length, () => 'eval{');
		builder.addInsertion(exprLoc.end + 1, ';Core:abort("")}');
	}

	builder.addNodeReplacement(node.expr, ancestors);

	return builder.execute();
}
