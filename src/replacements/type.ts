import {
	findNextItem,
	findNonWhitespaceCharacter,
	getNameEnd,
	replaceLineSeparators,
	strictIndexOf,
} from '../utils.js';
import type { ReplacementsBuilder } from './main.js';

const AT_SIGN_LEFT_PARENTHESIS = '@(';
const RIGHT_PARENTHESIS = ')';
const ARROW = '=>';
const LESS_THAN = '<';
const GREATER_THAN = '>';

export function replaceType(builder: ReplacementsBuilder, script: string, start: number): number {
	if (script.startsWith(AT_SIGN_LEFT_PARENTHESIS, start)) {
		return replaceFnType(builder, script, start);
	} else {
		return replaceNamedType(builder, script, start);
	}
}

function replaceFnType(builder: ReplacementsBuilder, script: string, start: number): number {
	const leftParenthesisEnd = start + AT_SIGN_LEFT_PARENTHESIS.length;
	const tokenAfterLeftParenthesisStart = findNonWhitespaceCharacter(script, leftParenthesisEnd);
	builder.addReplacement(leftParenthesisEnd, tokenAfterLeftParenthesisStart, replaceLineSeparators);

	let rightParenthesisStart: number;
	if (!script.startsWith(RIGHT_PARENTHESIS, tokenAfterLeftParenthesisStart)) {
		const argsEnd = replaceArgTypes(builder, script, tokenAfterLeftParenthesisStart);
		rightParenthesisStart = strictIndexOf(script, RIGHT_PARENTHESIS, argsEnd);
		builder.addReplacement(argsEnd, rightParenthesisStart, replaceLineSeparators);
	} else {
		rightParenthesisStart = tokenAfterLeftParenthesisStart;
	}

	const rightParenthesisEnd = rightParenthesisStart + RIGHT_PARENTHESIS.length;
	const arrowStart = strictIndexOf(script, ARROW, rightParenthesisEnd);
	builder.addReplacement(rightParenthesisEnd, arrowStart, replaceLineSeparators);

	const arrowEnd = arrowStart + ARROW.length;
	const resultStart = findNonWhitespaceCharacter(script, arrowEnd);
	builder.addReplacement(arrowEnd, resultStart, replaceLineSeparators);

	return replaceType(builder, script, resultStart);
}

function replaceArgTypes(builder: ReplacementsBuilder, script: string, start: number): number {
	let prevTokenEnd = replaceType(builder, script, start);
	let [currentTokenStart, separator] = findNextItem(script, prevTokenEnd);

	while (!script.startsWith(RIGHT_PARENTHESIS, currentTokenStart)) {
		if (separator !== 'comma') {
			builder.addInsertion(prevTokenEnd, ',');
		}
		builder.addReplacement(prevTokenEnd, currentTokenStart, replaceLineSeparators);

		prevTokenEnd = replaceType(builder, script, currentTokenStart);
		[currentTokenStart, separator] = findNextItem(script, prevTokenEnd);
	}

	return prevTokenEnd;
}

function replaceNamedType(builder: ReplacementsBuilder, script: string, start: number): number {
	const nameEnd = getNameEnd(script, start);
	const tokenAfterNameStart = findNonWhitespaceCharacter(script, nameEnd);
	if (!script.startsWith(LESS_THAN, tokenAfterNameStart)) {
		return nameEnd;
	}
	const ltEnd = tokenAfterNameStart + LESS_THAN.length;
	const innerStart = findNonWhitespaceCharacter(script, ltEnd);
	const innerEnd = replaceType(builder, script, innerStart);
	const gtStart = strictIndexOf(script, GREATER_THAN, innerEnd);
	const gtEnd = gtStart + GREATER_THAN.length;
	return gtEnd;
}
