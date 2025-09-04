import type { Ast } from 'aiscript@0.19.0';
import { ReplacementsBuilder, requireLoc } from './main.js';
import { includesSeparator, replaceLineSeparators, strictIndexOf, strictLastIndexOf } from '../utils.js';

const tmplEscapableChars = ['{', '}', '`'];
const COLON = ':';

export function replaceTmpl(node: Ast.Tmpl, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);
	for (let i = 0; i < node.tmpl.length; i++) {
		const element = node.tmpl[i]!;
		if (typeof element === 'string') {
			let start: number;
			if (i > 0) {
				const prevElement = node.tmpl[i - 1]!;
				start = strictIndexOf(script, '}', requireElementLoc(prevElement).end + 1);
			} else {
				start = loc.start;
			}
			let end: number;
			if (i < node.tmpl.length - 1) {
				const nextElement = node.tmpl[i + 1]!;
				end = strictLastIndexOf(script, '{', requireElementLoc(nextElement).start);
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

function requireElementLoc(element: string | Ast.Expression): Ast.Loc {
	if (typeof element !== 'object') {
		throw new TypeError('Expected expression');
	}
	return requireLoc(element);
}

export function replaceStr(node: Ast.Str, script: string): string {
	const loc = requireLoc(node);
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
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	let lastEnd: number | undefined;
	for (const [key, value] of node.value) {
		const valueLoc = requireLoc(value);
		const keyStart = strictLastIndexOf(script, key, valueLoc.start);
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

export function replaceArr(node: Ast.Arr, script: string): string {
	const loc = requireLoc(node);
	const builder = new ReplacementsBuilder(script, loc.start, loc.end);

	let lastEnd: number | undefined;
	for (const item of node.value) {
		const itemLoc = requireLoc(item);
		if (lastEnd != null && !includesSeparator(script, lastEnd, itemLoc.start)) {
			builder.addInsertion(lastEnd, ',');
		}
		builder.addNodeReplacement(item);
		lastEnd = itemLoc.end + 1;
	}

	return builder.execute();
}
