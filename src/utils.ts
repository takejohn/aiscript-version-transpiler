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

export function replaceLineSeparatorsWithSpaces(string: string): string {
	return string.replace(/[\n\r]/g, ' ');
}
