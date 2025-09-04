import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';

export function replaceCall(node: Ast.Call, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	if (script.startsWith('(', loc.start)) {
		builder.addNodeReplacement(node.target);
	}

	builder.addNodeReplacements(node.args);

	return builder.execute();
}
