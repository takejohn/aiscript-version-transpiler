import type { Ast } from 'aiscript.0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { findNonWhitespaceCharacter, replaceLineSeparators, replaceName, strictIndexOf } from '../utils.js';

const FOR_KEYWORD = 'for';
const LET_KEYWORD = 'let';
const LEFT_PARENTHESIS = '(';
const EQUAL_SIGN = '=';
const COMMA = ',';

export function replaceFor(node: Ast.For, script: string, ancestors: Ast.Node[]): string {
	if (node.times != null) {
		return replaceForTimes(node, script, ancestors);
	} else {
		return replaceForRange(node, script, ancestors);
	}
}

function replaceForTimes(node: Ast.For, script: string, ancestors: Ast.Node[]): string {
	if (node.times == null) {
		throw new TypeError('times should exist');
	}
	const loc = getActualLocation(node, script, false);
	const timesLoc = getActualLocation(node.times, script, true);
	const forLoc = getActualLocation(node.for, script, true);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addReplacement(loc.start + FOR_KEYWORD.length, timesLoc.start, replaceLineSeparators);
	builder.addNodeReplacement(node.times, ancestors);
	builder.addReplacement(timesLoc.end + 1, forLoc.start, replaceLineSeparators);
	builder.addNodeReplacement(node.for, ancestors);
	return builder.execute();
}

function replaceForRange(node: Ast.For, script: string, ancestors: Ast.Node[]): string {
	if (node.var == null || node.from == null || node.to == null) {
		throw new TypeError('var, from and to should exist');
	}

	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const headerStart = findNonWhitespaceCharacter(script, loc.start + FOR_KEYWORD.length);
	const hasParentheses = script.startsWith(LEFT_PARENTHESIS, headerStart);
	const leftParenthesesEnd = hasParentheses ? headerStart + LEFT_PARENTHESIS.length : headerStart;
	const letStart = strictIndexOf(script, LET_KEYWORD, leftParenthesesEnd);
	builder.addReplacement(loc.start + FOR_KEYWORD.length, letStart, replaceLineSeparators);

	const varStart = strictIndexOf(script, node.var, letStart + LET_KEYWORD.length);
	builder.addReplacement(letStart + LET_KEYWORD.length, varStart, replaceLineSeparators);

	const varEnd = varStart + node.var.length;
	builder.addReplacement(varStart, varEnd, replaceName);

	const tokenAfterVarStart = findNonWhitespaceCharacter(script, varEnd);
	builder.addReplacement(varEnd, tokenAfterVarStart, replaceLineSeparators);

	const hasFrom = script.startsWith(EQUAL_SIGN, tokenAfterVarStart);
	let tokenAfterFromStart: number;
	let fromEnd: number;
	if (hasFrom) {
		const fromLoc = getActualLocation(node.from, script, true);
		fromEnd = fromLoc.end + 1;
		builder.addReplacement(tokenAfterVarStart + EQUAL_SIGN.length, fromLoc.start, replaceLineSeparators);
		builder.addNodeReplacement(node.from, ancestors);
		tokenAfterFromStart = findNonWhitespaceCharacter(script, fromEnd);
	} else {
		tokenAfterFromStart = tokenAfterVarStart;
		fromEnd = varEnd;
	}

	const hasComma = script.startsWith(COMMA, tokenAfterFromStart);
	let tokenBeforeToEnd: number;
	if (hasComma) {
		tokenBeforeToEnd = tokenAfterFromStart + COMMA.length;
	} else {
		tokenBeforeToEnd = fromEnd;
		builder.addInsertion(fromEnd, COMMA);
	}

	const toLoc = getActualLocation(node.to, script, true);
	if (hasFrom || hasComma) {
		builder.addReplacement(tokenBeforeToEnd, toLoc.start, replaceLineSeparators);
	}

	builder.addNodeReplacement(node.to, ancestors);

	const forLoc = getActualLocation(node.for, script, true);
	builder.addReplacement(toLoc.end + 1, forLoc.start, replaceLineSeparators);
	builder.addNodeReplacement(node.for, ancestors);
	return builder.execute();
}
