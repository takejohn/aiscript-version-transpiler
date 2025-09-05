import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { replaceFn } from './fn.js';
import { findNonWhitespaceCharacter, replaceLineSeparators, replaceName, strictIndexOf } from '../utils.js';
import { replaceType } from './type.js';

const AT_SIGN = '@';
const LET_KEYWORD = 'let';
const VAR_KEYWORD = 'var';
const COLON = ':';
const EQUAL_SIGN = '=';

export function replaceDefinition(node: Ast.Definition, script: string): string {
	const loc = getActualLocation(node);
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
	const loc = getActualLocation(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const keyword = node.mut ? VAR_KEYWORD : LET_KEYWORD;
	const keywordEnd = loc.start + keyword.length;
	const nameStart = strictIndexOf(script, node.name, keywordEnd);
	builder.addReplacement(keywordEnd, nameStart, replaceLineSeparators);

	const nameEnd = nameStart + node.name.length;
	builder.addReplacement(nameStart, nameEnd, replaceName);

	const tokenAfterNameStart = findNonWhitespaceCharacter(script, nameEnd);
	let tokenBeforeEqualEnd: number;
	if (script.startsWith(COLON, tokenAfterNameStart)) {
		builder.addReplacement(nameEnd, tokenAfterNameStart, replaceLineSeparators);

		const colonEnd = tokenAfterNameStart + COLON.length;
		const typeStart = findNonWhitespaceCharacter(script, colonEnd);
		builder.addReplacement(colonEnd, typeStart, replaceLineSeparators);

		tokenBeforeEqualEnd = replaceType(builder, script, typeStart);
	} else {
		tokenBeforeEqualEnd = nameEnd;
	}

	const equalStart = strictIndexOf(script, EQUAL_SIGN, tokenBeforeEqualEnd);
	builder.addReplacement(tokenBeforeEqualEnd, equalStart, replaceLineSeparators);

	builder.addNodeReplacement(node.expr);
	return builder.execute();
}
