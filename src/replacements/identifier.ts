import { Ast } from 'aiscript@0.19.0';
import { replaceName } from '../utils.js';

export function replaceIdentifier(node: Ast.Identifier): string {
	return replaceName(node.name);
}
