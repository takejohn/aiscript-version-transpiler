import { Parser } from 'aiscript@0.19.0';

import { replaceSlices, type SliceReplacement } from './utils.js';
import { replaceRecursive, requireLoc } from './replacements/main.js';

export function transpile(script: string): string {
	const ast = Parser.parse(script);
	const replacements: readonly SliceReplacement[] = ast.map((node) => {
		const content = replaceRecursive(node, script);
		const { start, end } = requireLoc(node);
		return { start, end, content };
	}).filter((node): node is SliceReplacement => node !== null);
	return replaceSlices(script, replacements);
}
