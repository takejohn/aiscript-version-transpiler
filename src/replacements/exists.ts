import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { replaceLineSeparators } from '../utils.js';

export function replaceExists(node: Ast.Exists, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const identifierLoc = requireLoc(node.identifier);
	builder.addReplacement(loc.start, identifierLoc.end, replaceLineSeparators);

	builder.addNodeReplacement(node.identifier);

	return builder.execute();
}
