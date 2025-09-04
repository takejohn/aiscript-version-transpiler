import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { replaceName, strictIndexOf } from '../utils.js';

const AT_SIGN = '@';

export function replaceFn(node: Ast.Fn, script: string, name?: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	if (name != null) {
		const nameStart = strictIndexOf(script, name, loc.start + AT_SIGN.length);
		builder.addReplacement(nameStart, nameStart + name.length - 1, replaceName);
	}
	builder.addNodeReplacements(node.children);
	return builder.execute();
}
