import { Ast } from 'aiscript@0.19.0';
import { replaceNameWithNamespace } from '../utils.js';

export function replaceIdentifier(node: Ast.Identifier): string {
	return replaceNameWithNamespace(node.name);
}
