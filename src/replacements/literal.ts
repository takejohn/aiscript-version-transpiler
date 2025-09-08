import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation, replaceNodeAndLineSeparatorsInParentheses } from './main.js';
import {
	findLastNonWhitespaceCharacter,
	findNextItem,
	findNonWhitespaceCharacter,
	getNameEnd,
	getNameStart,
	isKeyword,
	isUnusedKeyword,
	replaceAllIgnoringComments,
	replaceLineSeparators,
	RESERVED_WORD_FOR_OBJ,
	strictIndexOf,
	strictLastIndexOf,
	trySkipComment,
	trySkipStrOrTmpl,
} from '../utils.js';

const tmplEscapableChars = ['{', '}', '`'];
const LEFT_BRACE = '{';
const RIGHT_BRACE = '}';
const COLON = ':';
const COMMA = ',';
const SEMICOLON = ';';

export function replaceTmpl(node: Ast.Tmpl, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	for (let i = 0; i < node.tmpl.length; i++) {
		const element = node.tmpl[i]!;
		if (typeof element === 'string') {
			let start: number;
			if (i > 0) {
				const prevElement = node.tmpl[i - 1]!;
				start = strictIndexOf(script, '}', requireElementLoc(prevElement, script).end + 1);
			} else {
				start = loc.start;
			}
			let end: number;
			if (i < node.tmpl.length - 1) {
				const nextElement = node.tmpl[i + 1]!;
				end = strictLastIndexOf(script, '{', requireElementLoc(nextElement, script).start);
			} else {
				end = loc.end;
			}
			builder.addReplacement(start, end + 1, (original) => replaceStringContent(original, tmplEscapableChars));
		} else {
			builder.addNodeReplacement(element, ancestors);
		}
	}
	return builder.execute();
}

function requireElementLoc(element: string | Ast.Expression, script: string): Ast.Loc {
	if (typeof element !== 'object') {
		throw new TypeError('Expected expression');
	}
	return getActualLocation(element, script, true);
}

export function replaceStr(node: Ast.Str, script: string): string {
	const loc = getActualLocation(node, script, false);
	const quote = script.at(loc.start);
	if (quote !== '\'' && quote !== '"') {
		throw new TypeError(`Unknown quote character: ${quote}`);
	}
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	builder.addReplacement(loc.start + 1, loc.end, (original) => replaceStringContent(original, [quote]));
	return builder.execute();
}

function replaceStringContent(original: string, escapableChars: readonly string[]): string {
	let result = '';
	let state: 'plain' | 'escape' = 'plain';
	for (const char of original) {
		switch (state) {
			case 'plain': {
				if (char === '\\') {
					state = 'escape';
				} else {
					result += char;
				}
				break;
			}
			case 'escape': {
				if (char === '\\') {
					result += '\\\\';
				} else {
					state = 'plain';
					if (escapableChars.includes(char)) {
						result += '\\';
					} else {
						result += '\\\\';
					}
					result += char;
				}
				break;
			}
		}
	}
	if (state === 'escape') {
		throw new TypeError('Malformed escape sequence');
	}
	return result;
}

export function replaceObj(node: Ast.Obj, script: string, ancestors: Ast.Node[]): string {
	if (includesReservedWord(node.value.keys())) {
		return replaceObjWithReservedWordKeys(node, script, ancestors);
	} else {
		return replaceObjWithoutReservedWordKeys(node, script, ancestors);
	}
}

function includesReservedWord(keys: Iterable<string>): boolean {
	for (const key of keys) {
		if (isUnusedKeyword(key)) {
			return true;
		}
	}
	return false;
}

function replaceObjWithoutReservedWordKeys(node: Ast.Obj, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	const foundKeys = new Set<string>();

	const leftBraceEnd = loc.start + LEFT_BRACE.length;
	let keyStart = findNonWhitespaceCharacter(script, leftBraceEnd);
	while (!script.startsWith(RIGHT_BRACE, keyStart)) {
		const keyEnd = getNameEnd(script, keyStart);
		const colonStart = strictIndexOf(script, COLON, keyEnd);
		const colonEnd = colonStart + COLON.length;
		const valueStart = findNonWhitespaceCharacter(script, colonEnd);
		const key = script.slice(keyStart, keyEnd);
		const valueEnd = getObjValueEnd(script, valueStart);
		const [nextEntryStart, separator] = findNextItem(script, valueEnd);
		const value = node.value.get(key);
		if (value == null) {
			throw new TypeError(`Unknown key '${key}'`);
		}

		if (foundKeys.has(key)) {
			let separatorEnd: number;
			if (separator === 'comma') {
				separatorEnd = strictIndexOf(script, COMMA, valueEnd) + COMMA.length;
			} else if (separator === 'semicolon') {
				separatorEnd = strictIndexOf(script, SEMICOLON, valueEnd) + SEMICOLON.length;
			} else {
				separatorEnd = valueEnd;
			}
			builder.addReplacement(keyStart, separatorEnd, () => '');
			keyStart = nextEntryStart;
			continue;
		}

		foundKeys.add(key);

		builder.addReplacement(keyEnd, colonStart, replaceLineSeparators);
		builder.addReplacement(colonEnd, valueStart, replaceLineSeparators);
		builder.addReplacement(
			valueStart,
			valueEnd,
			() => replaceNodeAndLineSeparatorsInParentheses(value, script, ancestors),
		);

		if (separator === 'comma') {
			const commaStart = strictIndexOf(script, COMMA, valueEnd);
			builder.addReplacement(valueEnd, commaStart, replaceLineSeparators);
		} else if (separator === 'semicolon') {
			const semicolonStart = strictIndexOf(script, SEMICOLON, valueEnd);
			builder.addReplacement(valueEnd, semicolonStart, replaceLineSeparators);
			builder.addReplacement(semicolonStart, semicolonStart + 1, () => ',');
		}

		if (script.startsWith(RIGHT_BRACE, nextEntryStart)) {
			break;
		} else if (separator == null) {
			builder.addInsertion(valueEnd, ',');
		}

		keyStart = nextEntryStart;
	}

	return builder.execute();
}

function replaceObjWithReservedWordKeys(node: Ast.Obj, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	const foundKeys = new Set<string>();

	const leftBraceEnd = loc.start + LEFT_BRACE.length;
	builder.addReplacement(loc.start, leftBraceEnd, () => `eval{let ${RESERVED_WORD_FOR_OBJ}={};`);

	let keyStart = findNonWhitespaceCharacter(script, leftBraceEnd);
	while (!script.startsWith(RIGHT_BRACE, keyStart)) {
		const keyEnd = getNameEnd(script, keyStart);
		const colonStart = strictIndexOf(script, COLON, keyEnd);
		const colonEnd = colonStart + COLON.length;
		const valueStart = findNonWhitespaceCharacter(script, colonEnd);
		const key = script.slice(keyStart, keyEnd);
		const valueEnd = getObjValueEnd(script, valueStart);
		const [nextEntryStart, separator] = findNextItem(script, valueEnd);
		const value = node.value.get(key);
		if (value == null) {
			throw new TypeError(`Unknown key '${key}'`);
		}

		if (foundKeys.has(key)) {
			let separatorEnd: number;
			if (separator === 'comma') {
				separatorEnd = strictIndexOf(script, COMMA, valueEnd) + COMMA.length;
			} else if (separator === 'semicolon') {
				separatorEnd = strictIndexOf(script, SEMICOLON, valueEnd) + SEMICOLON.length;
			} else {
				separatorEnd = valueEnd;
			}
			builder.addReplacement(keyStart, separatorEnd, () => '');
			keyStart = nextEntryStart;
			continue;
		}

		foundKeys.add(key);

		if (isKeyword(key)) {
			builder.addReplacement(keyStart, keyEnd, () => `${RESERVED_WORD_FOR_OBJ}["${key}"]`);
		} else {
			builder.addReplacement(keyStart, keyEnd, () => `${RESERVED_WORD_FOR_OBJ}.${key}`);
		}

		builder.addReplacement(keyEnd, colonStart, replaceLineSeparators);
		builder.addReplacement(colonStart, colonEnd, () => '=');
		builder.addReplacement(colonEnd, valueStart, replaceLineSeparators);
		builder.addReplacement(
			valueStart,
			valueEnd,
			() => replaceNodeAndLineSeparatorsInParentheses(value, script, ancestors),
		);

		if (separator === 'comma') {
			const commaStart = strictIndexOf(script, COMMA, valueEnd);
			builder.addReplacement(commaStart, commaStart + COMMA.length, () => ';');
		} else if (separator === 'new-line') {
			builder.addReplacement(valueEnd, nextEntryStart, (original) => replaceAllIgnoringComments(original, COMMA, ''));
		} else if (separator == null) {
			builder.addInsertion(valueEnd, ';');
		}

		keyStart = nextEntryStart;
	}

	const rightBraceEnd = keyStart + RIGHT_BRACE.length;
	builder.addReplacement(keyStart, rightBraceEnd, () => `${RESERVED_WORD_FOR_OBJ}}`);

	return builder.execute();
}

function getObjValueEnd(script: string, valueStart: number): number {
	let position = findNonWhitespaceCharacter(script, valueStart);
	let depth = 0;
	while (depth !== 0 || !script.startsWith(COLON, position)) {
		if (script.startsWith(LEFT_BRACE, position)) {
			depth++;
		} else if (script.startsWith(RIGHT_BRACE, position)) {
			depth--;
		}
		if (depth < 0) {
			return getLastObjValueEnd(script, position);
		}
		const afterComment = trySkipComment(script, position);
		if (afterComment != null) {
			position = afterComment;
			continue;
		}
		const afterStrOrTmpl = trySkipStrOrTmpl(script, position);
		if (afterStrOrTmpl != null) {
			position = afterStrOrTmpl;
			continue;
		}
		position = findNonWhitespaceCharacter(script, position + 1);
	}
	const nextKeyEnd = findLastNonWhitespaceCharacter(script, position);
	const nextKeyStart = getNameStart(script, nextKeyEnd + 1);
	return getLastObjValueEnd(script, nextKeyStart);
}

function getLastObjValueEnd(script: string, position: number): number {
	const valueEnd = findLastNonWhitespaceCharacter(script, position);
	if (script[valueEnd]! === COMMA || script[valueEnd]! === SEMICOLON) {
		return findLastNonWhitespaceCharacter(script, valueEnd) + 1;
	} else {
		return valueEnd + 1;
	}
}

export function replaceArr(node: Ast.Arr, script: string, ancestors: Ast.Node[]): string {
	const loc = getActualLocation(node, script, false);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	for (const item of node.value) {
		builder.addNodeReplacement(item, ancestors);
		const itemLoc = getActualLocation(item, script, true);
		const [nextTokenStart, separator] = findNextItem(script, itemLoc.end + 1);
		if (separator === 'comma') {
			const commaStart = strictIndexOf(script, ',', itemLoc.end + 1);
			builder.addReplacement(itemLoc.end + 1, commaStart, replaceLineSeparators);
		} else if (separator !== 'new-line' && !script.startsWith(']', nextTokenStart)) {
			builder.addInsertion(itemLoc.end + 1, ',');
		}
	}

	return builder.execute();
}
