import type { Ast } from 'aiscript.0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { replaceLineSeparators, replaceName, strictIndexOf } from '../utils.js';

const HASH3 = '###';

export function replaceMeta(node: Ast.Meta, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	if (node.name != null) {
		const nameStart = strictIndexOf(script, node.name, loc.start + HASH3.length);
		builder.addReplacement(nameStart, nameStart + node.name.length, replaceName);

		const nameEnd = nameStart + node.name.length;
		const valueStart = getActualLocation(node.value, script, false).start;
		builder.addReplacement(nameEnd, valueStart, replaceLineSeparators);
	}
	builder.addNodeReplacement(node.value, ancestors);
	return builder.execute();
}
