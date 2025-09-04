import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
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
	const loc = requireLoc(node);
	const timesLoc = requireLoc(node.times);
	const forLoc = requireLoc(node.for);
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

	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const letStart = strictIndexOf(script, LET_KEYWORD, loc.start + FOR_KEYWORD.length);
	builder.addReplacement(loc.start + FOR_KEYWORD.length, letStart, replaceLineSeparators);

	const varStart = strictIndexOf(script, node.var, letStart + LET_KEYWORD.length);
	builder.addReplacement(letStart + LET_KEYWORD.length, varStart, replaceLineSeparators);

	builder.addReplacement(varStart, varStart + node.var.length, replaceName);

	const tokenAfterVarStart = findNonWhitespaceCharacter(script, varStart + node.var.length);
	builder.addReplacement(varStart + node.var.length, tokenAfterVarStart, replaceLineSeparators);

	const toLoc = requireLoc(node.to);

	if (script.startsWith(EQUAL_SIGN, tokenAfterVarStart)) {
		const fromLoc = requireLoc(node.from);
		builder.addReplacement(tokenAfterVarStart + EQUAL_SIGN.length, fromLoc.start, replaceLineSeparators);

		const commaStart = strictIndexOf(script, COMMA, fromLoc.end + 1);
		builder.addReplacement(commaStart + COMMA.length, toLoc.start, replaceLineSeparators);
	} else if (script.startsWith(COMMA, tokenAfterVarStart)) {
		builder.addReplacement(tokenAfterVarStart + EQUAL_SIGN.length, toLoc.start, replaceLineSeparators);
	} else {
		throw new TypeError('Unknown token');
	}

	const forLoc = requireLoc(node.for);
	builder.addReplacement(toLoc.end + 1, forLoc.start, replaceLineSeparators);
	builder.addNodeReplacement(node.for);
	return builder.execute();
}
