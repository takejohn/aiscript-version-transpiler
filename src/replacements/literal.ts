import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, getActualLocation } from './main.js';
import {
	findNextItem,
	findNonWhitespaceCharacter,
	includesSeparator,
	isKeyword,
	isUnusedKeyword,
	replaceLineSeparators,
	RESERVED_WORD_FOR_OBJ,
	strictIndexOf,
	strictLastIndexOf,
} from '../utils.js';

const tmplEscapableChars = ['{', '}', '`'];
const LEFT_BRACE = '{';
const RIGHT_BRACE = '}';
const COLON = ':';
const COMMA = ',';

export function replaceTmpl(node: Ast.Tmpl, script: string): string {
	const loc = getActualLocation(node, script);
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
			builder.addNodeReplacement(element);
		}
	}
	return builder.execute();
}

function requireElementLoc(element: string | Ast.Expression, script: string): Ast.Loc {
	if (typeof element !== 'object') {
		throw new TypeError('Expected expression');
	}
	return getActualLocation(element, script);
}

export function replaceStr(node: Ast.Str, script: string): string {
	const loc = getActualLocation(node, script);
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

export function replaceObj(node: Ast.Obj, script: string): string {
	if (includesReservedWord(node.value.keys())) {
		return replaceObjWithReservedWordKey(node, script);
	}

	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	let lastEnd: number | undefined;
	for (const [key, value] of node.value) {
		const valueLoc = getActualLocation(value, script, true);
		const keyStart = strictIndexOf(script, key, lastEnd ?? loc.start + LEFT_BRACE.length);
		if (lastEnd != null && !includesSeparator(script, lastEnd, keyStart)) {
			builder.addInsertion(lastEnd, ',');
		}

		const keyEnd = keyStart + key.length;
		const colonStart = strictIndexOf(script, COLON, keyEnd);
		builder.addReplacement(keyEnd, colonStart, replaceLineSeparators);

		const colonEnd = colonStart + COLON.length;
		builder.addReplacement(colonEnd, valueLoc.start, replaceLineSeparators);

		builder.addNodeReplacement(value);

		lastEnd = valueLoc.end + 1;
	}

	return builder.execute();
}

function includesReservedWord(keys: Iterable<string>): boolean {
	for (const key of keys) {
		if (isUnusedKeyword(key)) {
			return true;
		}
	}
	return false;
}

function replaceObjWithReservedWordKey(node: Ast.Obj, script: string): string {
	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	const leftBraceEnd = loc.start + LEFT_BRACE.length;
	builder.addReplacement(loc.start, leftBraceEnd, () => `eval{let ${RESERVED_WORD_FOR_OBJ}={};`);

	let entryStart = findNonWhitespaceCharacter(script, leftBraceEnd);
	for (const [key, value] of node.value.entries()) {
		if (!script.startsWith(key, entryStart)) {
			throw new TypeError(`Expected key: ${key}`);
		}

		const valueLoc = getActualLocation(value, script, true);

		const [nextEntryStart, hasSeparator] = findNextItem(script, valueLoc.end + 1);

		const keyEnd = entryStart + key.length;
		if (isKeyword(key)) {
			builder.addReplacement(entryStart, keyEnd, () => `${RESERVED_WORD_FOR_OBJ}["${key}"]`);
		} else {
			builder.addReplacement(entryStart, keyEnd, () => `${RESERVED_WORD_FOR_OBJ}.${key}`);
		}

		const colonStart = strictIndexOf(script, COLON, keyEnd);
		builder.addReplacement(keyEnd, colonStart, replaceLineSeparators);

		const colonEnd = colonStart + COLON.length;
		builder.addReplacement(colonStart, colonEnd, () => '=');

		builder.addReplacement(colonEnd, valueLoc.start, replaceLineSeparators);

		builder.addNodeReplacement(value);

		if (hasSeparator === 'comma') {
			const commaStart = strictIndexOf(script, COMMA, valueLoc.end);
			builder.addReplacement(commaStart, commaStart + COMMA.length, () => ';');
		} else if (hasSeparator === 'new-line') {
			builder.addReplacement(valueLoc.end + 1, nextEntryStart, (original) => original.replaceAll(',', ''));
		} else {
			builder.addInsertion(valueLoc.end + 1, ';');
		}

		entryStart = nextEntryStart;
	}

	const rightBraceEnd = entryStart + RIGHT_BRACE.length;
	builder.addReplacement(entryStart, rightBraceEnd, () => `${RESERVED_WORD_FOR_OBJ}}`);

	return builder.execute();
}

export function replaceArr(node: Ast.Arr, script: string): string {
	const loc = getActualLocation(node, script);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	let lastEnd: number | undefined;
	for (const item of node.value) {
		const itemLoc = getActualLocation(item, script);
		if (lastEnd != null && !includesSeparator(script, lastEnd, itemLoc.start)) {
			builder.addInsertion(lastEnd, ',');
		}
		builder.addNodeReplacement(item);
		lastEnd = itemLoc.end + 1;
	}

	return builder.execute();
}
