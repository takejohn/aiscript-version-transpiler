import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { replaceFn } from './fn.js';
import { replaceName, strictIndexOf } from '../utils.js';

const AT_SIGN = '@';
const LET_KEYWORD = 'let';
const VAR_KEYWORD = 'var';

export function replaceDefinition(node: Ast.Definition, script: string): string {
	const loc = requireLoc(node);
	if (script.at(loc.start) === AT_SIGN) {
		if (node.expr.type !== 'fn') {
			throw new TypeError('Expected function');
		}
		return replaceFn(node.expr, script, node.name);
	} else {
		return replaceVarDef(node, script);
	}
}

function replaceVarDef(node: Ast.Definition, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	const keyword = node.mut ? VAR_KEYWORD : LET_KEYWORD;
	const nameStart = strictIndexOf(script, node.name, loc.start + keyword.length);
	builder.addReplacement(nameStart, nameStart + node.name.length, replaceName);
	builder.addNodeReplacement(node.expr);
	return builder.execute();
}
