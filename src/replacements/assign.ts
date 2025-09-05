import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';

export function replaceAssign(node: Ast.Assign | Ast.AddAssign | Ast.SubAssign, script: string): string {
	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addNodeReplacement(node.dest);
	builder.addNodeReplacement(node.expr);
	return builder.execute();
}
