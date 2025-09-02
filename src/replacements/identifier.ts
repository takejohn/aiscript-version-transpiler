import { Ast } from 'aiscript@0.19.0';

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

export function replaceIdentifier(node: Ast.Identifier): string {
	return replaceName(node.name);
}

function replaceName(name: string): string {
	const suffixStart = getSuffixUnderscoresStart(name);
	const base = name.slice(0, suffixStart);
	if (keywords.includes(base)) {
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
