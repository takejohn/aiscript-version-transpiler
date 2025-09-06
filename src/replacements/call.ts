import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { includesSeparator } from '../utils.js';

export function replaceCall(node: Ast.Call, script: string): string {
	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	if (isCallNotation(node, script)) {
		builder.addNodeReplacement(node.target);

		const excludeParentheses = node.args.length === 1
			&& getActualLocation(node.args[0]!, script, true).start === getActualLocation(node.target, script, true).end + 1;

		let lastEnd: number | undefined;
		for (const arg of node.args) {
			const argLoc = getActualLocation(arg, script, !excludeParentheses);
			if (lastEnd != null && !includesSeparator(script, lastEnd, argLoc.start)) {
				builder.addInsertion(lastEnd, ',');
			}
			builder.addNodeReplacement(arg, !excludeParentheses);
			lastEnd = argLoc.end + 1;
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
