import type { Ast } from 'aiscript.0.19.0';
import { getActualLocation, ReplacementsBuilder } from './main.js';
import { isKeyword } from '../utils.js';

export function replaceProp(node: Ast.Prop, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	const targetLoc = getActualLocation(node.target, script, true);

	builder.addNodeReplacement(node.target, ancestors);

	if (node.target.type === 'num' && !script.startsWith('(', targetLoc.start)) {
		const targetCode = script.slice(targetLoc.start, targetLoc.end);
		if (!targetCode.includes('.')) {
			builder.addInsertion(targetLoc.start, '(');
			builder.addInsertion(targetLoc.end + 1, ')');
		}
	}

	if (isKeyword(node.name)) {
		const targetLoc = getActualLocation(node.target, script, true);
		builder.addReplacement(targetLoc.end + 1, loc.end + 1, () => `["${node.name}"]`);
	}

	return builder.execute();
}
