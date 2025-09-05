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
	position?: number,
): number {
	const result = string.indexOf(searchString, position);
	if (result < 0) {
		throw new TypeError(`String '${searchString}' not found`);
	}
	return result;
}

export function strictLastIndexOf(
	string: string,
	searchString: string,
	position?: number,
): number {
	const result = string.lastIndexOf(searchString, position);
	if (result < 0) {
		throw new TypeError(`String '${searchString}' not found`);
	}
	return result;
}

export function findNonWhitespaceCharacter(string: string, position = 0): number {
	for (let i = position; i < string.length; i++) {
		const char = string[i]!;
		if (!SPACE_CHARS.test(char) && !LINE_SEPARATORS.test(char)) {
			return i;
		}
	}
	throw new TypeError(`Non whitespace character not found`);
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

export function includesSeparator(string: string, start = 0, end = string.length): boolean {
	for (let i = start; i < end; i++) {
		const char = string[i]!;
		if (LINE_SEPARATORS.test(char) || char === ',') {
			return true;
		}
	}
	return false;
}

const keywords: readonly string[] = [
	'case',
	'default',
	'as',
	'async',
	'await',
	'catch',
	'component',
	'constructor',
	'dictionary',
	'do',
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

const COLON = ':';

export function replaceNameWithNamespace(name: string): string {
	const segments = name.split(COLON);
	return segments.map(replaceName).join(COLON);
}

export function isKeyword(name: string): boolean {
	return keywords.includes(name);
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
