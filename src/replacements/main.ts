import { Ast } from 'aiscript@0.19.0';
import { replaceSlices, sliceInclusive, type SliceReplacement } from '../utils.js';
import { replaceIf } from './if.js';
import { replaceIdentifier } from './identifier.js';
import { replaceDefinition } from './definition.js';
import { replaceFn } from './fn.js';
import { replaceFor } from './for.js';
import { replaceBlock } from './block.js';
import { replaceNamespace } from './namespace.js';
import { replaceArr, replaceObj, replaceStr, replaceTmpl } from './literal.js';
import { replaceMeta } from './meta.js';

export class ReplacementsBuilder {
	private replacements: SliceReplacement[] = [];

	private endOffset = 0;

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
		this._addReplacement(start, end, content);
	}

	public addNodeReplacement(node: Ast.Node): void {
		const loc = requireLoc(node);
		this._addReplacement(
			loc.start,
			loc.end,
			replaceNode(node, this.script),
		);
	}

	public addNodeReplacements(nodes: Iterable<Ast.Node>): void {
		for (const node of nodes) {
			this.addNodeReplacement(node);
		}
	}

	public execute(): string {
		return sliceInclusive(
			replaceSlices(this.script, this.replacements),
			this.start,
			this.end + this.endOffset,
		);
	}

	private _addReplacement(
		start: number,
		end: number,
		content: string,
	): void {
		this.replacements.push({ start, end, content });
		this.endOffset += content.length - (end - start + 1);
	}
}

export function replaceAst(ast: Ast.Node[], script: string): string {
	const replacements: readonly SliceReplacement[] = ast.map((node) => {
		const content = replaceNode(node, script);
		const { start, end } = requireLoc(node);
		return { start, end, content };
	}).filter((node): node is SliceReplacement => node !== null);
	return replaceSlices(script, replacements);
}

export function replaceNode(
	node: Ast.Node,
	script: string,
): string {
	switch (node.type) {
		case 'ns': {
			return replaceNamespace(node, script);
		}
		case 'meta': {
			return replaceMeta(node, script);
		}
		case 'def': {
			return replaceDefinition(node, script);
		}
		case 'return': {
			throw new Error('Not implemented');
		}
		case 'each': {
			throw new Error('Not implemented');
		}
		case 'for': {
			return replaceFor(node, script);
		}
		case 'loop': {
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
			return replaceFn(node, script);
		}
		case 'match': {
			throw new Error('Not implemented');
		}
		case 'block': {
			return replaceBlock(node, script);
		}
		case 'exists': {
			throw new Error('Not implemented');
		}
		case 'tmpl': {
			return replaceTmpl(node, script);
		}
		case 'str': {
			return replaceStr(node, script);
		}
		case 'break':
		case 'continue':
		case 'num':
		case 'bool':
		case 'null': {
			const loc = requireLoc(node);
			return sliceInclusive(script, loc.start, loc.end);
		}
		case 'obj': {
			return replaceObj(node, script);
		}
		case 'arr': {
			return replaceArr(node, script);
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
