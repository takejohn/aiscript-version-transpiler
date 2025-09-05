import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { findNonWhitespaceCharacter, replaceLineSeparators, replaceName, strictIndexOf } from '../utils.js';

const FOR_KEYWORD = 'for';
const LET_KEYWORD = 'let';
const EQUAL_SIGN = '=';
const COMMA = ',';

export function replaceFor(node: Ast.For, script: string): string {
	if (node.times != null) {
		return replaceForTimes(node, script);
	} else {
		return replaceForRange(node, script);
	}
}

function replaceForTimes(node: Ast.For, script: string): string {
	if (node.times == null) {
		throw new TypeError('times should exist');
	}
	const loc = getActualLocation(node);
	const timesLoc = getActualLocation(node.times);
	const forLoc = getActualLocation(node.for);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addReplacement(loc.start + FOR_KEYWORD.length, timesLoc.start, replaceLineSeparators);
	builder.addReplacement(timesLoc.end + 1, forLoc.start, replaceLineSeparators);
	builder.addNodeReplacement(node.for);
	return builder.execute();
}

function replaceForRange(node: Ast.For, script: string): string {
	if (node.var == null || node.from == null || node.to == null) {
		throw new TypeError('var, from and to should exist');
	}

	const loc = getActualLocation(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const letStart = strictIndexOf(script, LET_KEYWORD, loc.start + FOR_KEYWORD.length);
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
		const fromLoc = getActualLocation(node.from);
		fromEnd = fromLoc.end + 1;
		builder.addReplacement(tokenAfterVarStart + EQUAL_SIGN.length, fromLoc.start, replaceLineSeparators);
		builder.addNodeReplacement(node.from);
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

	const toLoc = getActualLocation(node.to);
	if (hasFrom || hasComma) {
		builder.addReplacement(tokenBeforeToEnd, toLoc.start, replaceLineSeparators);
	}

	builder.addNodeReplacement(node.to);

	const forLoc = getActualLocation(node.for);
	builder.addReplacement(toLoc.end + 1, forLoc.start, replaceLineSeparators);
	builder.addNodeReplacement(node.for);
	return builder.execute();
}
