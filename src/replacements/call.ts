import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { findNextItem } from '../utils.js';

export function replaceCall(node: Ast.Call, script: string): string {
	const parenthesesLoc = node.loc;
	if (parenthesesLoc == null) {
		throw new TypeError('node does not have loc');
	}

	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	if (isCallNotation(node, script)) {
		builder.addNodeReplacement(node.target);

		if (
			node.args.length === 1
			&& getActualLocation(node.args[0]!, script, true).start === getActualLocation(node.target, script, true).end + 1
		) {
			const arg = node.args[0]!;
			builder.addNodeReplacement(arg, true, { start: parenthesesLoc.start + 1, end: parenthesesLoc.end - 1 });
		} else {
			for (const arg of node.args) {
				builder.addNodeReplacement(arg, true);
				const argLoc = getActualLocation(arg, script, true);
				const [nextTokenStart, separator] = findNextItem(script, argLoc.end + 1);
				if (separator == null && !script.startsWith(')', nextTokenStart)) {
					builder.addInsertion(argLoc.end + 1, ',');
				}
			}
		}
	} else {
		for (const arg of node.args) {
			builder.addNodeReplacement(arg);
		}
	}

	return builder.execute();
}

function isCallNotation(node: Ast.Call, script: string): boolean {
	const nodeLoc = getActualLocation(node, script, false);
	const targetLoc = getActualLocation(node.target, script, true);
	return nodeLoc.start === targetLoc.start && script.startsWith('(', targetLoc.end + 1);
}
