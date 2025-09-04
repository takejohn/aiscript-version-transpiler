import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';

export function replaceBlock(node: Ast.Block, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addNodeReplacements(node.statements);
	return builder.execute();
}
