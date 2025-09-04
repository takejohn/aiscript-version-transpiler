import { Parser } from 'aiscript@0.19.0';

import { replaceAst } from './replacements/main.js';

export function transpile(script: string): string {
	const ast = Parser.parse(script);
	return replaceAst(ast, script);
}
