import type { Ast } from 'aiscript.0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { findNonWhitespaceCharacter, replaceLineSeparators, strictLastIndexOf, findNextItem } from '../utils.js';

const MATCH_KEYWORD = 'match';
const ARROW = '=>';
const ASTERISK = '*';

export function replaceMatch(node: Ast.Match, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const aboutLoc = getActualLocation(node.about, script, true);
	builder.addReplacement(loc.start + MATCH_KEYWORD.length, aboutLoc.start, replaceLineSeparators);

	builder.addNodeReplacement(node.about, ancestors, true);

	const bodyStart = findNonWhitespaceCharacter(script, aboutLoc.end + 1);
	builder.addReplacement(aboutLoc.end + 1, bodyStart, replaceLineSeparators);

	for (const caseArm of node.qs) {
		const armLeftHandLoc = getActualLocation(caseArm.q, script, true);
		builder.addInsertion(armLeftHandLoc.start, 'case ');
		builder.addNodeReplacement(caseArm.q, ancestors);

		const arrowStart = findNonWhitespaceCharacter(script, armLeftHandLoc.end + 1);
		builder.addReplacement(armLeftHandLoc.end + 1, arrowStart, replaceLineSeparators);

		const arrowEnd = arrowStart + ARROW.length;
		const armRightHandStart = findNonWhitespaceCharacter(script, arrowEnd);
		builder.addReplacement(arrowEnd, armRightHandStart, replaceLineSeparators);

		replaceArmRightHand(caseArm.a, builder, script, ancestors);

		const caseArmEnd = getActualLocation(caseArm.a, script, true).end + 1;
		const [nextTokenStart, separator] = findNextItem(script, caseArmEnd);
		if (!script.startsWith('}', nextTokenStart) && separator !== 'comma' && separator !== 'new-line') {
			builder.addInsertion(caseArmEnd, ',');
		}
	}

	if (node.default != null) {
		const defaultLoc = getActualLocation(node.default, script, true);
		const arrowStart = strictLastIndexOf(script, ARROW, defaultLoc.start);
		const asteriskStart = strictLastIndexOf(script, ASTERISK, arrowStart);
		const asteriskEnd = asteriskStart + ASTERISK.length;
		builder.addReplacement(asteriskStart, asteriskEnd, () => 'default');

		builder.addReplacement(asteriskEnd, arrowStart, replaceLineSeparators);

		const arrowEnd = arrowStart + ARROW.length;
		const armRightHandStart = findNonWhitespaceCharacter(script, arrowEnd);
		builder.addReplacement(arrowEnd, armRightHandStart, replaceLineSeparators);

		replaceArmRightHand(node.default, builder, script, ancestors);
	}

	return builder.execute();
}

function replaceArmRightHand(node: Ast.Node, builder: ReplacementsBuilder, script: string, ancestors: Ast.Node[]): void {
	if (node.type === 'obj') {
		const nodeLoc = getActualLocation(node, script, true);
		if (!script.startsWith('(', nodeLoc.start)) {
			builder.addInsertion(nodeLoc.start, '(');
			builder.addInsertion(nodeLoc.end + 1, ')');
		}
	}
	builder.addNodeReplacement(node, ancestors);
}
