import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { replaceLineSeparators, replaceName, strictIndexOf } from '../utils.js';

const COLON2 = '::';
const LEFT_BRACE = '{';

export function replaceNamespace(node: Ast.Namespace, script: string): string {
	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	const nameStart = strictIndexOf(script, node.name, loc.start + COLON2.length);
	const nameEnd = nameStart + node.name.length;
	const bodyStart = strictIndexOf(script, LEFT_BRACE, nameEnd + 1);
	builder.addReplacement(loc.start + COLON2.length, nameStart, replaceLineSeparators);
	builder.addReplacement(nameStart, nameEnd, replaceName);
	builder.addReplacement(nameEnd, bodyStart, replaceLineSeparators);
	builder.addNodeReplacements(node.members);
	return builder.execute();
}
