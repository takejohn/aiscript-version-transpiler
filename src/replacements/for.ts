import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { replaceLineSeparators, strictIndexOf } from '../utils.js';

const FOR_KEYWORD = 'for';
const LET_KEYWORD = 'let';

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
	builder.addReplacement(loc.start + FOR_KEYWORD.length, timesLoc.start - 1, replaceLineSeparators);
	builder.addReplacement(timesLoc.end + 1, forLoc.start - 1, replaceLineSeparators);
	builder.addNodeReplacement(node.for);
	return builder.execute();
}

function replaceForRange(node: Ast.For, script: string): string {
	if (node.var == null || node.from == null || node.to == null) {
		throw new TypeError('var, from and to should exist');
	}
	const loc = requireLoc(node);
	const letStart = strictIndexOf(script, LET_KEYWORD, loc.start + FOR_KEYWORD.length);
	const toLoc = requireLoc(node.to);
	const forLoc = requireLoc(node.for);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addReplacement(loc.start + FOR_KEYWORD.length, letStart, replaceLineSeparators);
	builder.addReplacement(toLoc.end + 1, forLoc.start - 1, replaceLineSeparators);
	builder.addNodeReplacement(node.for);
	return builder.execute();
}
