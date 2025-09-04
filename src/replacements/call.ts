import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { includesSeparator } from '../utils.js';

export function replaceCall(node: Ast.Call, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	if (script.startsWith('(', loc.start)) {
		builder.addNodeReplacement(node.target);

		let lastEnd: number | undefined;
		for (const arg of node.args) {
			const argLoc = requireLoc(arg);
			if (lastEnd != null && !includesSeparator(script, lastEnd, argLoc.start)) {
				builder.addInsertion(lastEnd, ',');
			}
			builder.addNodeReplacement(arg);
			lastEnd = argLoc.end + 1;
		}
	}

	return builder.execute();
}
