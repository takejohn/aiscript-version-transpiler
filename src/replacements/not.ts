import type { Ast } from 'aiscript.0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';

export function replaceNot(node: Ast.Not, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addNodeReplacement(node.expr, ancestors);
	return builder.execute();
}
