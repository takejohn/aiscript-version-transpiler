import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';

export function replaceBinaryOperation(node: Ast.And | Ast.Or, script: string): string {
	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addNodeReplacement(node.left);
	builder.addNodeReplacement(node.right);
	return builder.execute();
}
