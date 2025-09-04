import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { findNonWhitespaceCharacter, replaceLineSeparators, replaceName, strictIndexOf } from '../utils.js';

const KEYWORD_EACH = 'each';
const KEYWORD_LET = 'let';
const LEFT_PARENTHESIS = '(';
const RIGHT_PARENTHESIS = ')';
const COMMA = ',';

export function replaceEach(node: Ast.Each, script: string): string {
	const loc = requireLoc(node);

	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const headerStart = findNonWhitespaceCharacter(script, loc.start + KEYWORD_EACH.length);
	const hasParentheses = script[headerStart] === LEFT_PARENTHESIS;
	builder.addReplacement(loc.start + KEYWORD_EACH.length, headerStart - 1, replaceLineSeparators);

	const letStart = strictIndexOf(script, KEYWORD_LET, headerStart);
	const varStart = findNonWhitespaceCharacter(script, letStart + KEYWORD_LET.length);
	builder.addReplacement(letStart + KEYWORD_LET.length, varStart - 1, replaceLineSeparators);

	builder.addReplacement(varStart, varStart + node.var.length - 1, replaceName);

	const itemsLoc = requireLoc(node.items);
	const commaStart = strictIndexOf(script, COMMA, varStart + node.var.length);
	builder.addReplacement(varStart + node.var.length, commaStart - 1, replaceLineSeparators);

	builder.addReplacement(commaStart + COMMA.length, itemsLoc.start - 1, replaceLineSeparators);

	let bodyStart: number;
	if (hasParentheses) {
		const rightParenthesisStart = strictIndexOf(script, RIGHT_PARENTHESIS, itemsLoc.end + 1);
		bodyStart = findNonWhitespaceCharacter(script, rightParenthesisStart + RIGHT_PARENTHESIS.length);
	} else {
		bodyStart = findNonWhitespaceCharacter(script, itemsLoc.end + 1);
	}
	builder.addReplacement(itemsLoc.end + 1, bodyStart, replaceLineSeparators);

	return builder.execute();
}
