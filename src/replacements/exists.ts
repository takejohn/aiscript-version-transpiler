import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { replaceLineSeparators } from '../utils.js';

export function replaceExists(node: Ast.Exists, script: string): string {
	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const identifierLoc = getActualLocation(node.identifier, script);
	builder.addReplacement(loc.start, identifierLoc.start, replaceLineSeparators);

	builder.addNodeReplacement(node.identifier);

	return builder.execute();
}
