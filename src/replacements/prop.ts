import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { isKeyword } from '../utils.js';

export function replaceProp(node: Ast.Prop, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	builder.addNodeReplacement(node.target);

	if (isKeyword(node.name)) {
		builder.addReplacement(loc.start, loc.end + 1, () => `["${node.name}"]`);
	}

	return builder.execute();
}
