import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';

export function replaceBlock(node: Ast.Block, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addNodeReplacements(node.statements, ancestors);
	return builder.execute();
}
