import { Parser } from 'aiscript.0.19.0';

import { replaceAst } from './replacements/main.js';
import { defaultConfig } from './config.js';
import type { TranspilerConfig } from './config.js';

export function transpile(script: string, config?: TranspilerConfig): string {
	const ast = Parser.parse(script);
	return replaceAst(ast, script, [], config ?? defaultConfig);
}
