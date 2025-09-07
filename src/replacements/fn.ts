import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import {
	findNextItem,
	findNonWhitespaceCharacter,
	getNameEnd,
	replaceLineSeparators,
	replaceName,
	strictIndexOf,
} from '../utils.js';
import { replaceType } from './type.js';

const AT_SIGN = '@';
const LEFT_PARENTHESIS = '(';
const RIGHT_PARENTHESIS = ')';
const LEFT_BRACE = '{';
const COLON = ':';

export function replaceFn(node: Ast.Fn, script: string, ancestors: Ast.Node[], name?: string): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	let tokenBeforeLeftParenthesisEnd: number;
	if (name != null) {
		const nameStart = strictIndexOf(script, name, loc.start + AT_SIGN.length);
		const nameEnd = nameStart + name.length;
		builder.addReplacement(nameStart, nameEnd, replaceName);
		tokenBeforeLeftParenthesisEnd = nameEnd;
	} else {
		tokenBeforeLeftParenthesisEnd = loc.start + AT_SIGN.length;
	}

	const leftParenthesisStart = strictIndexOf(script, LEFT_PARENTHESIS, tokenBeforeLeftParenthesisEnd);
	const leftParenthesisEnd = leftParenthesisStart + LEFT_PARENTHESIS.length;
	const tokenAfterLeftParenthesisStart = findNonWhitespaceCharacter(script, leftParenthesisEnd);
	let rightParenthesisStart: number;
	if (script.startsWith(RIGHT_PARENTHESIS, tokenAfterLeftParenthesisStart)) {
		rightParenthesisStart = tokenAfterLeftParenthesisStart;
	} else {
		const argsEnd = replaceArgs(builder, script, tokenAfterLeftParenthesisStart);
		rightParenthesisStart = strictIndexOf(script, RIGHT_PARENTHESIS, argsEnd);
	}

	const rightParenthesisEnd = rightParenthesisStart + RIGHT_PARENTHESIS.length;
	const tokenAfterRightParenthesisStart = findNonWhitespaceCharacter(script, rightParenthesisEnd);
	let tokenBeforeBodyEnd: number;
	if (script.startsWith(COLON, tokenAfterRightParenthesisStart)) {
		builder.addReplacement(rightParenthesisEnd, tokenAfterRightParenthesisStart, replaceLineSeparators);

		const colonEnd = tokenAfterRightParenthesisStart + COLON.length;
		const returnTypeStart = findNonWhitespaceCharacter(script, colonEnd);
		builder.addReplacement(colonEnd, returnTypeStart, replaceLineSeparators);

		tokenBeforeBodyEnd = replaceType(builder, script, returnTypeStart);
	} else {
		tokenBeforeBodyEnd = rightParenthesisEnd;
	}

	const bodyStart = strictIndexOf(script, LEFT_BRACE, tokenBeforeBodyEnd);
	builder.addReplacement(tokenBeforeBodyEnd, bodyStart, replaceLineSeparators);
	builder.addNodeReplacements(node.children, ancestors);
	return builder.execute();
}

function replaceArgs(builder: ReplacementsBuilder, script: string, start: number): number {
	let prevArgEnd = replaceArg(builder, script, start);
	let [currentArgStart, separator] = findNextItem(script, prevArgEnd);

	while (!script.startsWith(RIGHT_PARENTHESIS, currentArgStart)) {
		if (separator === 'comma') {
			const commaStart = strictIndexOf(script, ',', prevArgEnd);
			builder.addReplacement(prevArgEnd, commaStart, replaceLineSeparators);
		} else if (separator !== 'new-line') {
			builder.addInsertion(prevArgEnd, ',');
		}

		prevArgEnd = replaceArg(builder, script, currentArgStart);
		[currentArgStart, separator] = findNextItem(script, prevArgEnd);
	}

	return prevArgEnd;
}

function replaceArg(builder: ReplacementsBuilder, script: string, start: number): number {
	const nameEnd = getNameEnd(script, start);
	builder.addReplacement(start, nameEnd, replaceName);

	const tokenAfterNameStart = findNonWhitespaceCharacter(script, nameEnd);
	if (script.startsWith(COLON, tokenAfterNameStart)) {
		builder.addReplacement(nameEnd, tokenAfterNameStart, replaceLineSeparators);

		const colonEnd = tokenAfterNameStart + COLON.length;
		const typeStart = findNonWhitespaceCharacter(script, colonEnd);
		builder.addReplacement(colonEnd, typeStart, replaceLineSeparators);

		return replaceType(builder, script, typeStart);
	} else {
		return nameEnd;
	}
}
