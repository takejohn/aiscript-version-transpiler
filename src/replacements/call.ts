import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { findNextItem, replaceLineSeparators, strictIndexOf } from '../utils.js';

export function replaceCall(node: Ast.Call, script: string, ancestors: Ast.Node[]): string {
	const parenthesesLoc = node.loc;
	if (parenthesesLoc == null) {
		throw new TypeError('node does not have loc');
	}

	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	if (isCallNotation(node, script)) {
		builder.addNodeReplacement(node.target, ancestors);

		if (
			node.args.length === 1
			&& getActualLocation(node.args[0]!, script, true).start === getActualLocation(node.target, script, true).end + 1
		) {
			const arg = node.args[0]!;
			builder.addNodeReplacement(arg, ancestors, true, { start: parenthesesLoc.start + 1, end: parenthesesLoc.end - 1 });
		} else {
			for (const arg of node.args) {
				builder.addNodeReplacement(arg, ancestors, true);
				const argLoc = getActualLocation(arg, script, true);
				const [nextTokenStart, separator] = findNextItem(script, argLoc.end + 1);
				if (separator === 'comma') {
					const commaStart = strictIndexOf(script, ',', argLoc.end + 1);
					builder.addReplacement(argLoc.end + 1, commaStart, replaceLineSeparators);
				} else if (separator !== 'new-line' && !script.startsWith(')', nextTokenStart)) {
					builder.addInsertion(argLoc.end + 1, ',');
				}
			}
		}
	} else {
		for (const arg of node.args) {
			builder.addNodeReplacement(arg, ancestors);
		}
	}

	return builder.execute();
}

function isCallNotation(node: Ast.Call, script: string): boolean {
	const nodeLoc = getActualLocation(node, script, false);
	const targetLoc = getActualLocation(node.target, script, true);
	return nodeLoc.start === targetLoc.start && script.startsWith('(', targetLoc.end + 1);
}
