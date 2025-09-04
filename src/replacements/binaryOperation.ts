import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';

export function replaceBinaryOperation(node: Ast.And | Ast.Or, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addNodeReplacement(node.left);
	builder.addNodeReplacement(node.right);
	return builder.execute();
}
