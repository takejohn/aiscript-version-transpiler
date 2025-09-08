import { Ast } from 'aiscript.0.19.0';
import { getActualLocation } from './main.js';
import { replaceLineSeparators, strictIndexOf } from '../utils.js';
import { ReplacementsBuilder } from './main.js';

const KEYWORD_IF = 'if';
const KEYWORD_ELIF = 'elif';
const KEYWORD_ELSE = 'else';

export function replaceIf(node: Ast.If, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	const condLoc = getActualLocation(node.cond, script, true);
	const thenLoc = getActualLocation(node.then, script, true);

	builder.addReplacement(loc.start + KEYWORD_IF.length, condLoc.start, replaceLineSeparators);

	builder.addNodeReplacement(node.cond, ancestors);
	builder.addReplacement(condLoc.end + 1, thenLoc.start, replaceLineSeparators);
	builder.addNodeReplacement(node.then, ancestors);

	let lastThenLoc = thenLoc;
	for (const { cond: elseifCond, then: elseifThen } of node.elseif) {
		const keywordElifStart = strictIndexOf(
			script,
			KEYWORD_ELIF,
			lastThenLoc.end + 1,
		);
		const elseifCondLoc = getActualLocation(elseifCond, script, true);
		const elseifThenLoc = getActualLocation(elseifThen, script, true);
		builder.addReplacement(keywordElifStart + KEYWORD_ELIF.length, elseifCondLoc.start, replaceLineSeparators);
		builder.addNodeReplacement(elseifCond, ancestors);
		builder.addReplacement(elseifCondLoc.end + 1, elseifThenLoc.start, replaceLineSeparators);
		builder.addNodeReplacement(elseifThen, ancestors);
		lastThenLoc = elseifThenLoc;
	}

	if (node.else != null) {
		const lastElseif = node.elseif.at(-1);
		const lastThen = lastElseif ? lastElseif.then : node.then;
		const keywordElseStart = strictIndexOf(
			script,
			KEYWORD_ELSE,
			getActualLocation(lastThen, script, true).end + 1,
		);
		builder.addReplacement(keywordElseStart + KEYWORD_ELSE.length, getActualLocation(node.else, script, true).start, replaceLineSeparators);
		builder.addNodeReplacement(node.else, ancestors);
	}

	return builder.execute();
}
