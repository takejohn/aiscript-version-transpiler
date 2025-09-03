import { Ast } from 'aiscript@0.19.0';
import { replaceSlices, sliceInclusive, SliceReplacement } from '../utils.ts';
import { replaceIf } from './if.ts';
import { replaceIdentifier } from './identifier.ts';

export class ReplacementsBuilder {
	private replacements: SliceReplacement[] = [];

	public constructor(
		private script: string,
		private start: number,
		private end: number,
	) {}

	/**
	 * `start` and `end` are inclusive indices.
	 */
	public addReplacement(
		start: number,
		end: number,
		replaceFunc: (original: string) => string,
	): void {
		const original = sliceInclusive(this.script, start, end);
		const content = replaceFunc(original);
		this.replacements.push({ start, end, content });
	}

	public addNodeReplacement(node: Ast.Node): void {
		const loc = requireLoc(node);
		this.replacements.push({
			start: loc.start,
			end: loc.end,
			content: replaceRecursive(node, this.script),
		});
	}

	public execute(): string {
		return sliceInclusive(
			replaceSlices(this.script, this.replacements),
			this.start,
			this.end,
		);
	}
}

export function replaceRecursive(
	node: Ast.Node,
	script: string,
): string {
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
			return replaceIf(node, script);
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
		case 'num':
		case 'bool': {
			const loc = requireLoc(node);
			return sliceInclusive(script, loc.start, loc.end);
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
		default: {
			const _node: never = node;
			throw new TypeError(`Unknown node type ${(_node as Ast.Node).type}`);
		}
	}
}

export function requireLoc(node: Ast.Node): Ast.Loc {
	if (!node.loc) {
		throw new TypeError('node does not have loc');
	}
	return node.loc;
}
