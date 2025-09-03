export interface SliceReplacement {
	start: number;
	end: number;
	content: string;
}

/**
 * Replaces slices of a string based on the provided replacements.
 *
 * @param string - The original string to perform replacements on.
 * @param replacements - An array of replacement objects, each containing
 *   `start`, `end`, and `content` properties.
 *   `start` and `end` are inclusive indices.
 * @returns The modified string with all replacements applied.
 * @throws {RangeError} If any of the replacement ranges overlap.
 */
export function replaceSlices(
	string: string,
	replacements: readonly SliceReplacement[],
): string {
	const sortedReplacements = replacements.toSorted((a, b) => a.start - b.start);
	let result = '';

	let originalStart = 0;
	for (const { start, end, content } of sortedReplacements) {
		if (start < originalStart) {
			throw new RangeError('Overlapping ranges are not allowed');
		}
		result += string.slice(originalStart, start);
		result += content;
		originalStart = end + 1;
	}
	result += string.slice(originalStart);

	return result;
}

export function sliceInclusive(
	string: string,
	start: number,
	end: number,
): string {
	return string.slice(start, end + 1);
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

const LINE_SEPARATORS = /[\n\r]/;

export function replaceLineSeparators(string: string): string {
	let result = '';
	let state: 'plain' | 'slash' | 'line-comment' | 'block-comment' | 'block-comment-end' = 'plain';

	for (const char of string) {
		switch (state) {
			case 'plain': {
				if (char === '/') {
					state = 'slash';
					result += char;
				} else if (LINE_SEPARATORS.test(char)) {
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
