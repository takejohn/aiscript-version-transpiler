import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { replaceLineSeparators, replaceName, strictIndexOf } from '../utils.js';

const HASH3 = '###';

export function replaceMeta(node: Ast.Meta, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	if (node.name != null) {
		const nameStart = strictIndexOf(script, node.name, loc.start + HASH3.length);
		builder.addReplacement(nameStart, nameStart + node.name.length - 1, replaceName);
		builder.addReplacement(nameStart + node.name.length, requireLoc(node.value).start - 1, replaceLineSeparators);
	}
	builder.addNodeReplacement(node.value);
	return builder.execute();
}
