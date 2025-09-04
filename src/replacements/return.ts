import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { replaceLineSeparators } from '../utils.js';

const RETURN_KEYWORD = 'return';

export function replaceReturn(node: Ast.Return, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addReplacement(loc.start + RETURN_KEYWORD.length, requireLoc(node.expr).start - 1, replaceLineSeparators);
	builder.addNodeReplacement(node.expr);
	return builder.execute();
}
