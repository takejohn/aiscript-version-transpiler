import type { Ast } from 'aiscript@0.19.0';
import { getActualLocation, ReplacementsBuilder } from './main.js';
import { isKeyword } from '../utils.js';

export function replaceProp(node: Ast.Prop, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	builder.addNodeReplacement(node.target, ancestors);

	if (isKeyword(node.name)) {
		const targetLoc = getActualLocation(node.target, script, true);
		builder.addReplacement(targetLoc.end + 1, loc.end + 1, () => `["${node.name}"]`);
	}

	return builder.execute();
}
