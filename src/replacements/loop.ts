import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import { findNonWhitespaceCharacter, replaceLineSeparators } from '../utils.js';

const LOOP_KEYWORD = 'loop';

export function replaceLoop(node: Ast.Loop, script: string): string {
	const loc = getActualLocation(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	const bodyStart = findNonWhitespaceCharacter(script, loc.start + LOOP_KEYWORD.length);
	builder.addReplacement(loc.start + LOOP_KEYWORD.length, bodyStart, replaceLineSeparators);
	builder.addNodeReplacements(node.statements);
	return builder.execute();
}
