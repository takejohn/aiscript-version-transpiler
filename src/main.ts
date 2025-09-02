import { Ast, Parser } from 'aiscript@0.19.0';

import { replaceIdentifier } from './replacements/identifier.ts';
import { replaceSlices, SliceReplacement } from './utils.ts';

export function transpile(script: string): string {
	const ast = Parser.parse(script);
	const replacements: readonly SliceReplacement[] = ast.map((node) => {
		const content = visit(node, script);
		const { start, end } = requireLoc(node);
		return { start, end, content };
	}).filter((node): node is SliceReplacement => node !== null);
	return replaceSlices(script, replacements);
}

function visit(node: Ast.Node, script: string): string | null {
	switch (node.type) {
		case 'ns': {
			throw new Error('Not implemented');
		}
		case 'meta': {
			throw new Error('Not implemented');
		}
		case 'def': {
			throw new Error('Not implemented');
		}
		case 'return': {
			throw new Error('Not implemented');
		}
		case 'each': {
			throw new Error('Not implemented');
		}
		case 'for': {
			throw new Error('Not implemented');
		}
		case 'loop': {
			throw new Error('Not implemented');
		}
		case 'break': {
			throw new Error('Not implemented');
		}
		case 'continue': {
			throw new Error('Not implemented');
		}
		case 'assign': {
			throw new Error('Not implemented');
		}
		case 'addAssign': {
			throw new Error('Not implemented');
		}
		case 'subAssign': {
			throw new Error('Not implemented');
		}
		case 'if': {
			throw new Error('Not implemented');
		}
		case 'fn': {
			throw new Error('Not implemented');
		}
		case 'match': {
			throw new Error('Not implemented');
		}
		case 'block': {
			throw new Error('Not implemented');
		}
		case 'exists': {
			throw new Error('Not implemented');
		}
		case 'tmpl': {
			throw new Error('Not implemented');
		}
		case 'str': {
			throw new Error('Not implemented');
		}
		case 'num': {
			throw new Error('Not implemented');
		}
		case 'bool': {
			throw new Error('Not implemented');
		}
		case 'null': {
			throw new Error('Not implemented');
		}
		case 'obj': {
			throw new Error('Not implemented');
		}
		case 'arr': {
			throw new Error('Not implemented');
		}
		case 'not': {
			throw new Error('Not implemented');
		}
		case 'and': {
			throw new Error('Not implemented');
		}
		case 'or': {
			throw new Error('Not implemented');
		}
		case 'identifier': {
			return replaceIdentifier(node);
		}
		case 'call': {
			throw new Error('Not implemented');
		}
		case 'index': {
			throw new Error('Not implemented');
		}
		case 'prop': {
			throw new Error('Not implemented');
		}
		case 'namedTypeSource': {
			throw new Error('Not implemented');
		}
		case 'fnTypeSource': {
			throw new Error('Not implemented');
		}
	}
}

function requireLoc(node: Ast.Node): Ast.Loc {
	if (!node.loc) {
		throw new TypeError('node does not have loc');
	}
	return node.loc;
}
