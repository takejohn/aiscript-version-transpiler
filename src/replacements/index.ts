import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';

export function replaceIndex(node: Ast.Index, script: string): string {
	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addNodeReplacement(node.target);
	builder.addNodeReplacement(node.index);
	return builder.execute();
}
