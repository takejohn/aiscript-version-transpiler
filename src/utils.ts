export interface SliceReplacement {
	start: number;
	end: number;
	content: string;
}

const LINE_SEPARATORS = /[\n\r]/;
const SPACE_CHARS = /[ \t]/;

/**
 * Replaces slices of a string based on the provided replacements.
 *
 * @param string - The original string to perform replacements on.
 * @param replacements - An array of replacement objects, each containing
 *   `start`, `end`, and `content` properties.
 *   `end` is an exclusive index.
 * @returns The modified string with all replacements applied.
 * @throws {RangeError} If any of the replacement ranges overlap.
 */
export function replaceSlices(
	string: string,
	replacements: readonly SliceReplacement[],
): string {
	const sortedReplacements = replacements.toSorted((a, b) => {
		if (a.start === b.start) {
			return a.end - b.end;
		}
		return a.start - b.start;
	});
	let result = '';

	let originalStart = 0;
	for (const { start, end, content } of sortedReplacements) {
		if (start < originalStart) {
			throw new RangeError(`Overlapping ranges are not allowed (${start} < ${originalStart})`);
		}
		result += string.slice(originalStart, start);
		result += content;
		originalStart = end;
	}
	result += string.slice(originalStart);

	return result;
}

export function strictIndexOf(
	string: string,
	searchString: string,
	position: number,
): number {
	const result = findNonWhitespaceCharacter(string, position);
	if (string.startsWith(searchString, result)) {
		return result;
	}
	throw new TypeError(
		`String '${searchString}' not found (position: ${position})`,
	);
}

export function strictLastIndexOf(
	string: string,
	searchString: string,
	position?: number,
): number {
	const result = findLastNonWhitespaceCharacter(string, position) + 1 - searchString.length;
	if (string.startsWith(searchString, result)) {
		return result;
	}
	throw new TypeError(
		`String '${searchString}' not found (position: ${position})`,
	);
}

export function findNonWhitespaceCharacter(string: string, position = 0): number {
	const result = findNonWhitespaceCharacterOptional(string, position);
	if (result != null) {
		return result;
	}
	throw new TypeError(`Non whitespace character not found`);
}

export function findLastNonWhitespaceCharacter(string: string, position = 0): number {
	const result = findLastNonWhitespaceCharacterOptional(string, position);
	if (result != null) {
		return result;
	}
	throw new TypeError(`Non whitespace character not found`);
}

export function findNonWhitespaceCharacterOptional(string: string, position = 0, end = string.length): number | undefined {
	for (let i = position; i < end;) {
		const char = string[i]!;
		if (!SPACE_CHARS.test(char) && !LINE_SEPARATORS.test(char)) {
			const afterComment = trySkipComment(string, i);
			if (afterComment == null) {
				return i;
			}
			i = afterComment;
			continue;
		}
		i++;
	}
}

export function findLastNonWhitespaceCharacterOptional(string: string, position = string.length, start = 0): number | undefined {
	const comments = [...getComments(string, start, position)];
	for (let i = position - 1; i >= start;) {
		const char = string[i]!;
		const comment = comments.find(([_start, end]) => end === i);
		if (comment != null) {
			i = comment[0] - 1;
			continue;
		}
		if (!SPACE_CHARS.test(char) && !LINE_SEPARATORS.test(char)) {
			return i;
		}
		i--;
	}
}

function* getComments(script: string, start = 0, end = script.length): Iterable<[number, number]> {
	const state: ('plain' | 'tmpl-string' | 'tmpl-escape')[] = ['plain'];

	for (let i = start; i < end;) {
		if (state.length === 0) {
			return;
		}

		const char = script[i]!;
		switch (state.at(-1)!) {
			case 'plain': {
				if (char === '\'' || char === '"') {
					i = skipStr(script, i);
				} else if (char === '`') {
					state.push('tmpl-string');
					i++;
				} else if (char === '{') {
					state.push('plain');
					i++;
				} else if (char === '}') {
					state.pop();
					i++;
				} else {
					const commentEnd = trySkipComment(script, i);
					if (commentEnd != null) {
						yield [i, commentEnd];
						i = commentEnd;
					} else {
						i++;
					}
				}
				break;
			}

			case 'tmpl-string': {
				if (char === '\\') {
					state.push('tmpl-escape');
				} else if (char === '{') {
					state.push('plain');
				} else if (char === '`') {
					state.pop();
				}
				i++;
				break;
			}

			case 'tmpl-escape': {
				if (char !== '\\') {
					state.pop();
				}
				i++;
				break;
			}
		}
	}
}

export function trySkipStrOrTmpl(script: string, start: number): number | undefined {
	if (script.startsWith('`', start)) {
		return skipTmpl(script, start);
	}
	if (script.startsWith('"', start) || script.startsWith('\'', start)) {
		return skipStr(script, start);
	}
}

function skipStr(script: string, start: number): number {
	const quote = script[start]!;
	let state: 'string' | 'escape' = 'string';

	for (let i = start + 1; i < script.length; i++) {
		const char = script[i]!;
		if (state === 'string') {
			if (char === '\\') {
				state = 'escape';
			} else if (char === quote) {
				return i + 1;
			}
		} else if (state === 'escape') {
			if (char !== '\\') {
				state = 'string';
			}
		}
	}

	throw new TypeError('Unexpected end of file');
}

function skipTmpl(script: string, start: number): number {
	let state: 'string' | 'escape' | 'expr' = 'string';
	let depth = 0;

	for (let i = start + 1; i < script.length;) {
		const char = script[i]!;

		switch (state) {
			case 'string': {
				if (char === '\\') {
					state = 'escape';
				} else if (char === '{') {
					depth++;
					state = 'expr';
				} else if (char === '`') {
					return i + 1;
				}
				break;
			}

			case 'escape': {
				if (char !== '\\') {
					state = 'string';
				}
				break;
			}

			case 'expr': {
				const afterComment = trySkipComment(script, i);
				if (afterComment != null) {
					i = afterComment;
					continue;
				}

				if (char === '{') {
					depth++;
				} else if (char === '}') {
					depth--;
				}
				if (depth == 0) {
					state = 'string';
				}
				break;
			}
		}

		i++;
	}

	throw new TypeError('Unexpected end of file');
}

export function replaceLineSeparators(string: string): string {
	let result = '';
	let state: 'plain' | 'slash' | 'line-comment' | 'block-comment' | 'block-comment-end' | 'indent' = 'plain';

	for (const char of string) {
		switch (state) {
			case 'plain': {
				if (char === '/') {
					state = 'slash';
					result += char;
				} else if (LINE_SEPARATORS.test(char)) {
					state = 'indent';
					result += ' ';
				} else {
					result += char;
				}
				break;
			}

			case 'slash': {
				if (char === '/') {
					state = 'line-comment';
					result += '*';
				} else if (char === '*') {
					state = 'block-comment';
					result += '*';
				} else {
					result += char;
					state = 'plain';
				}
				break;
			}

			case 'line-comment': {
				if (LINE_SEPARATORS.test(char)) {
					state = 'plain';
					result += char + '*/ ';
				} else {
					result += char;
				}
				break;
			}

			case 'block-comment': {
				if (char === '*') {
					state = 'block-comment-end';
				}
				result += char;
				break;
			}

			case 'block-comment-end': {
				if (char === '/') {
					state = 'plain';
				} else if (char !== '*') {
					state = 'block-comment';
				}
				result += char;
				break;
			}

			case 'indent': {
				if (!SPACE_CHARS.test(char)) {
					state = 'plain';
					result += char;
				}
			}
		}
	}

	switch (state) {
		case 'line-comment':
			throw new TypeError('Unterminated line comment');
		case 'block-comment':
		case 'block-comment-end':
			throw new TypeError('Unterminated block comment');
	}

	return result;
}

export function findNextItem(string: string, start: number): [number, 'comma' | 'new-line' | 'semicolon' | null] {
	let separator: 'comma' | 'new-line' | 'semicolon' | null = null;
	for (let i = start; i < string.length;) {
		const char = string[i]!;
		if (char === ',') {
			separator = 'comma';
		} else if (char === ';') {
			separator = 'semicolon';
		} else if (LINE_SEPARATORS.test(char)) {
			if (separator == null) {
				separator = 'new-line';
			}
		} else if (!SPACE_CHARS.test(char)) {
			const afterComment = trySkipComment(string, i);
			if (afterComment == null) {
				return [i, separator];
			}
			i = afterComment;
			continue;
		}
		i++;
	}
	throw new TypeError(`Non whitespace character not found`);
}

export function replaceAllIgnoringComments(string: string, searchString: string, replacement: string): string {
	let result = '';
	for (let i = 0; i < string.length;) {
		const afterComment = trySkipComment(string, i);
		if (afterComment != null) {
			result += string.slice(i, afterComment);
			i = afterComment;
		} else if (string.startsWith(searchString, i)) {
			result += replacement;
			i += searchString.length;
		} else {
			result += string[i]!;
			i++;
		}
	}
	return result;
}

export function trySkipComment(string: string, start: number): number | undefined {
	if (string[start] !== '/') {
		return;
	}

	const afterSlash = start + 1;
	if (string[afterSlash] === '/') {
		let i = afterSlash + 1;
		for (; i < string.length; i++) {
			if (LINE_SEPARATORS.test(string[i]!)) {
				return i;
			}
		}
		return i;
	} else if (string[afterSlash] === '*') {
		for (let i = afterSlash + 1; i < string.length; i++) {
			if (string[i] === '*' && string[i + 1] === '/') {
				return i + 2;
			}
		}
		throw new TypeError('Unterminated block comment');
	}
}

export const RESERVED_WORD_FOR_OBJ = '__AVT';

const usedKeywords: readonly string[] = [
	'case',
	'default',
	'do',
	RESERVED_WORD_FOR_OBJ, // for object key replacement
];

const conventionalUnusedKeywords: readonly string[] = [
	'attr',
	'attribute',
	'class',
	'export',
	'fn',
	'static',
	'struct',
	'import',
	'meta',
	'module',
	'namespace',
];

const newUnusedKeywords: readonly string[] = [
	'as',
	'async',
	'await',
	'catch',
	'component',
	'constructor',
	'dictionary',
	'enum',
	'finally',
	'hash',
	'in',
	'interface',
	'out',
	'private',
	'public',
	'ref',
	'table',
	'this',
	'throw',
	'trait',
	'try',
	'undefined',
	'use',
	'using',
	'when',
	'yield',
	'is',
	'new',
];

const unusedKeywords: readonly string[] = [
	...conventionalUnusedKeywords,
	...newUnusedKeywords,
];

const keywords: readonly string[] = [
	...usedKeywords,
	...unusedKeywords,
];

const COLON = ':';

export function replaceNameWithNamespace(name: string): string {
	const segments = name.split(COLON);
	return segments.map(replaceName).join(COLON);
}

export function isKeyword(name: string): boolean {
	return keywords.includes(name);
}

export function isUsedKeyword(name: string): boolean {
	return usedKeywords.includes(name);
}

export function isUnusedKeyword(name: string): boolean {
	return unusedKeywords.includes(name);
}

export function replaceName(name: string): string {
	const suffixStart = getSuffixUnderscoresStart(name);
	const base = name.slice(0, suffixStart);
	if (isKeyword(base)) {
		return base + '_'.repeat(name.length - suffixStart + 1);
	}
	return name;
}

function getSuffixUnderscoresStart(name: string): number {
	for (let i = name.length - 1; i >= 0; i--) {
		if (name[i] !== '_') {
			return i + 1;
		}
	}
	return name.length;
}

export function getNameEnd(script: string, start: number): number {
	if (start >= script.length) {
		throw new TypeError('Unexpected end of file');
	}

	const startChar = script[start]!;
	if (!/[A-Z_]/i.test(startChar)) {
		throw new TypeError('Invalid name');
	}

	for (let position = start + 1; position < script.length; position++) {
		const char = script[position]!;
		if (!/[A-Z0-9_]/i.test(char)) {
			return position;
		}
	}
	return script.length;
}

export function getNameStart(script: string, end: number): number {
	for (let position = end - 1; position >= 0; position--) {
		const char = script[position]!;
		if (!/[A-Z0-9_]/i.test(char)) {
			return position + 1;
		}
	}
	return script.length;
}
