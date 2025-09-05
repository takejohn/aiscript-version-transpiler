import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { findNonWhitespaceCharacter, replaceLineSeparators, replaceName, strictIndexOf } from '../utils.js';

const KEYWORD_EACH = 'each';
const KEYWORD_LET = 'let';
const LEFT_PARENTHESIS = '(';
const RIGHT_PARENTHESIS = ')';
const COMMA = ',';

export function replaceEach(node: Ast.Each, script: string): string {
	const loc = getActualLocation(node);

	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const headerStart = findNonWhitespaceCharacter(script, loc.start + KEYWORD_EACH.length);
	const hasParentheses = script[headerStart] === LEFT_PARENTHESIS;
	builder.addReplacement(loc.start + KEYWORD_EACH.length, headerStart, replaceLineSeparators);

	const letStart = strictIndexOf(script, KEYWORD_LET, headerStart);
	const varStart = findNonWhitespaceCharacter(script, letStart + KEYWORD_LET.length);
	builder.addReplacement(letStart + KEYWORD_LET.length, varStart, replaceLineSeparators);

	builder.addReplacement(varStart, varStart + node.var.length, replaceName);

	const varEnd = varStart + node.var.length;
	const nextTokenStart = findNonWhitespaceCharacter(script, varEnd);
	builder.addReplacement(varEnd, nextTokenStart, replaceLineSeparators);

	const itemsLoc = getActualLocation(node.items);
	if (script.startsWith(COMMA, nextTokenStart)) {
		builder.addReplacement(nextTokenStart + COMMA.length, itemsLoc.start, replaceLineSeparators);
	} else {
		builder.addInsertion(varEnd, COMMA);
	}

	builder.addNodeReplacement(node.items);

	let bodyStart: number;
	if (hasParentheses) {
		const rightParenthesisStart = strictIndexOf(script, RIGHT_PARENTHESIS, itemsLoc.end + 1);
		bodyStart = findNonWhitespaceCharacter(script, rightParenthesisStart + RIGHT_PARENTHESIS.length);
	} else {
		bodyStart = findNonWhitespaceCharacter(script, itemsLoc.end + 1);
	}
	builder.addReplacement(itemsLoc.end + 1, bodyStart, replaceLineSeparators);

	builder.addNodeReplacement(node.for);

	return builder.execute();
}
