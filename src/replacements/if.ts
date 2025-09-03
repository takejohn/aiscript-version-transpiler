import { Ast } from 'aiscript@0.19.0';
import { requireLoc } from './main.ts';
import { replaceLineSeparatorsWithSpaces, strictIndexOf } from '../utils.ts';
import { ReplacementsBuilder } from './main.ts';

const KEYWORD_IF = 'if';
const KEYWORD_ELIF = 'elif';
const KEYWORD_ELSE = 'else';

export function replaceIf(node: Ast.If, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	const condLoc = requireLoc(node.cond);
	const thenLoc = requireLoc(node.then);

	builder.addReplacement(
		loc.start + KEYWORD_IF.length,
		condLoc.start - 1,
		replaceLineSeparatorsWithSpaces,
	);

	builder.addNodeReplacement(node.cond);
	builder.addReplacement(
		condLoc.end + 1,
		thenLoc.start - 1,
		replaceLineSeparatorsWithSpaces,
	);
	builder.addNodeReplacement(node.then);

	for (const { cond: elseifCond, then: elseifThen } of node.elseif) {
		const keywordElifStart = strictIndexOf(
			script,
			KEYWORD_ELIF,
			thenLoc.end + 1,
		);
		const elseifCondLoc = requireLoc(elseifCond);
		builder.addReplacement(
			keywordElifStart + KEYWORD_ELIF.length,
			elseifCondLoc.start - 1,
			replaceLineSeparatorsWithSpaces,
		);
		builder.addNodeReplacement(elseifCond);
		builder.addReplacement(
			elseifCondLoc.end + 1,
			requireLoc(elseifThen).start - 1,
			replaceLineSeparatorsWithSpaces,
		);
		builder.addNodeReplacement(elseifThen);
	}

	if (node.else != null) {
		const lastElseif = node.elseif.at(-1);
		const lastThen = lastElseif ? lastElseif.then : node.then;
		const keywordElseStart = strictIndexOf(
			script,
			KEYWORD_ELSE,
			requireLoc(lastThen).end + 1,
		);
		builder.addReplacement(
			keywordElseStart + KEYWORD_ELSE.length,
			requireLoc(node.else).start - 1,
			replaceLineSeparatorsWithSpaces,
		);
		builder.addNodeReplacement(node.else);
	}

	return builder.execute();
}
