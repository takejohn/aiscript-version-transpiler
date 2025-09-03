import { Parser } from 'aiscript@0.19.0';

import { replaceSlices, SliceReplacement } from './utils.ts';
import { replaceRecursive, requireLoc } from './replacements/main.ts';

export function transpile(script: string): string {
	const ast = Parser.parse(script);
	const replacements: readonly SliceReplacement[] = ast.map((node) => {
		const content = replaceRecursive(node, script);
		const { start, end } = requireLoc(node);
		return { start, end, content };
	}).filter((node): node is SliceReplacement => node !== null);
	return replaceSlices(script, replacements);
}
