import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { includesSeparator, findNonWhitespaceCharacter, replaceLineSeparators, strictLastIndexOf } from '../utils.js';

const MATCH_KEYWORD = 'match';
const ASTERISK = '*';

export function replaceMatch(node: Ast.Match, script: string): string {
	const loc = getActualLocation(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const aboutLoc = getActualLocation(node.about);
	builder.addReplacement(loc.start + MATCH_KEYWORD.length, aboutLoc.start, replaceLineSeparators);

	const bodyStart = findNonWhitespaceCharacter(script, aboutLoc.end + 1);
	builder.addReplacement(aboutLoc.end + 1, bodyStart, replaceLineSeparators);

	for (const caseArm of node.qs) {
		builder.addInsertion(getActualLocation(caseArm.q).start, 'case ');
		builder.addNodeReplacement(caseArm.q);
		builder.addNodeReplacement(caseArm.a);

		const caseArmEnd = getActualLocation(caseArm.a).end + 1;
		const nextTokenStart = findNonWhitespaceCharacter(script, caseArmEnd);
		if (!script.startsWith('}', nextTokenStart) && !includesSeparator(script, caseArmEnd, nextTokenStart)) {
			builder.addInsertion(caseArmEnd, ',');
		}
	}

	if (node.default != null) {
		const defaultLoc = getActualLocation(node.default);
		const asteriskStart = strictLastIndexOf(script, ASTERISK, defaultLoc.start);
		builder.addReplacement(asteriskStart, asteriskStart + 1, () => 'default');
		builder.addNodeReplacement(node.default);
	}

	return builder.execute();
}
