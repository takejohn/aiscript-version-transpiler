import { Ast } from 'aiscript@0.19.0';
import {
	findLastNonWhitespaceCharacterOptional,
	findNonWhitespaceCharacterOptional,
	replaceLineSeparators,
	replaceSlices,
	type SliceReplacement,
} from '../utils.js';
import { replaceIf } from './if.js';
import { replaceIdentifier } from './identifier.js';
import { replaceDefinition } from './definition.js';
import { replaceFn } from './fn.js';
import { replaceFor } from './for.js';
import { replaceBlock } from './block.js';
import { replaceNamespace } from './namespace.js';
import { replaceArr, replaceObj, replaceStr, replaceTmpl } from './literal.js';
import { replaceMeta } from './meta.js';
import { replaceReturn } from './return.js';
import { replaceEach } from './each.js';
import { replaceLoop } from './loop.js';
import { replaceAssign } from './assign.js';
import { replaceMatch } from './match.js';
import { replaceExists } from './exists.js';
import { replaceNot } from './not.js';
import { replaceBinaryOperation } from './binaryOperation.js';
import { replaceCall } from './call.js';
import { replaceIndex } from './index.js';
import { replaceProp } from './prop.js';

export class ReplacementsBuilder {
	private replacements: SliceReplacement[] = [];

	private endOffset = 0;

	private end: number;

	public constructor(
		private script: string,
		private start: number,
		end: number,
	) {
		this.end = end + 1;
	}

	public addInsertion(position: number, content: string): void {
		this._addReplacement(position, position, content);
	}

	public addReplacement(start: number, end: number, replaceFunc: (original: string) => string): void {
		const original = this.script.slice(start, end);
		const content = replaceFunc(original);
		this._addReplacement(start, end, content);
	}

	public addNodeReplacement(node: Ast.Node, includeEnclosingParentheses = true): void {
		const innerLoc = getActualLocation(node, this.script, false);
		if (includeEnclosingParentheses) {
			const outerLoc = getEnclosingParentheses(innerLoc, this.script) ?? innerLoc;
			this._addReplacement(
				outerLoc.start,
				outerLoc.end + 1,
				replaceNode(node, this.script, true),
			);
		} else {
			this._addReplacement(
				innerLoc.start,
				innerLoc.end + 1,
				replaceNode(node, this.script, false),
			);
		}
	}

	public addNodeReplacements(nodes: Iterable<Ast.Node>): void {
		for (const node of nodes) {
			this.addNodeReplacement(node);
		}
	}

	public execute(): string {
		return replaceSlices(this.script, this.replacements).slice(
			this.start,
			this.end + this.endOffset,
		);
	}

	private _addReplacement(
		start: number,
		end: number,
		content: string,
	): void {
		for (const existing of this.replacements) {
			if (start < existing.end && existing.start < end) {
				throw new RangeError(
					`Attempting to replace overlapping slices (adding: ${start}..${end}, existing: ${existing.start}..${existing.end})`,
				);
			}
		}
		this.replacements.push({ start, end, content });
		this.endOffset += content.length - (end - start);
	}
}

export function replaceAst(ast: Ast.Node[], script: string): string {
	const replacements: readonly SliceReplacement[] = ast.map((node) => {
		const content = replaceNode(node, script, true);
		const { start, end } = getActualLocation(node, script, true);
		return { start, end: end + 1, content };
	});
	return replaceSlices(script, replacements);
}

export function replaceNode(
	node: Ast.Node,
	script: string,
	includeOuterParentheses: boolean,
): string {
	if (includeOuterParentheses) {
		const innerLoc = getActualLocation(node, script, false);
		const enclosingParentheses = getEnclosingParentheses(innerLoc, script);
		const outerLoc = enclosingParentheses ?? innerLoc;
		const builder = new ReplacementsBuilder(script, outerLoc.start, outerLoc.end);
		if (enclosingParentheses != null) {
			builder.addReplacement(enclosingParentheses.start + 1, innerLoc.start, replaceLineSeparators);
			builder.addReplacement(innerLoc.end + 1, enclosingParentheses.end, replaceLineSeparators);
		}
		builder.addNodeReplacement(node, false);
		return builder.execute();
	}

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
			return replaceReturn(node, script);
		}
		case 'each': {
			return replaceEach(node, script);
		}
		case 'for': {
			return replaceFor(node, script);
		}
		case 'loop': {
			return replaceLoop(node, script);
		}
		case 'assign':
		case 'addAssign':
		case 'subAssign': {
			return replaceAssign(node, script);
		}
		case 'if': {
			return replaceIf(node, script);
		}
		case 'fn': {
			return replaceFn(node, script);
		}
		case 'match': {
			return replaceMatch(node, script);
		}
		case 'block': {
			return replaceBlock(node, script);
		}
		case 'exists': {
			return replaceExists(node, script);
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
			const loc = getActualLocation(node, script, false);
			return script.slice(loc.start, loc.end + 1);
		}
		case 'obj': {
			return replaceObj(node, script);
		}
		case 'arr': {
			return replaceArr(node, script);
		}
		case 'not': {
			return replaceNot(node, script);
		}
		case 'and':
		case 'or': {
			return replaceBinaryOperation(node, script);
		}
		case 'identifier': {
			return replaceIdentifier(node);
		}
		case 'call': {
			return replaceCall(node, script);
		}
		case 'index': {
			return replaceIndex(node, script);
		}
		case 'prop': {
			return replaceProp(node, script);
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

export function getActualLocation(node: Ast.Node, script: string, includeEnclosingParentheses = false): Ast.Loc {
	if (includeEnclosingParentheses) {
		const innerLoc = getActualLocation(node, script, false);
		const enclosingParentheses = getEnclosingParentheses(innerLoc, script);
		if (enclosingParentheses != null) {
			return enclosingParentheses;
		}
		return innerLoc;
	}

	const loc = node.loc;
	if (loc == null) {
		throw new TypeError('node does not have loc');
	}

	switch (node.type) {
		case 'ns':
		case 'meta':
		case 'def':
		case 'return':
		case 'each':
		case 'for':
		case 'loop':
		case 'break':
		case 'continue':
		case 'assign':
		case 'addAssign':
		case 'subAssign':
		case 'if':
		case 'fn':
		case 'match':
		case 'block':
		case 'exists':
		case 'tmpl':
		case 'str':
		case 'num':
		case 'bool':
		case 'null':
		case 'obj':
		case 'arr':
		case 'not':
		case 'identifier':
		{
			return loc;
		}
		case 'and':
		case 'or': {
			return {
				start: getActualLocation(node.left, script, true).start,
				end: loc.end,
			};
		}
		case 'call': {
			const targetLocation = getActualLocation(node.target, script, true);
			const firstArg = node.args.at(0);
			const lastArg = node.args.at(-1);
			let start: number;
			if (firstArg != null) {
				start = Math.min(getActualLocation(firstArg, script, true).start, targetLocation.start);
			} else {
				start = targetLocation.start;
			}
			let end: number;
			if (lastArg != null) {
				end = Math.max(getActualLocation(lastArg, script, true).end, loc.end);
			} else {
				end = targetLocation.end;
			}
			return { start, end };
		}
		case 'index':
		case 'prop': {
			return {
				start: getActualLocation(node.target, script, true).start,
				end: loc.end,
			};
		}
		case 'namedTypeSource':
		case 'fnTypeSource': {
			throw new Error('Not implemented');
		}
		default: {
			const _node: never = node;
			throw new TypeError(`Unknown node type ${(_node as Ast.Node).type}`);
		}
	}
}

export function getEnclosingParentheses(innerLoc: Ast.Loc, script: string): Ast.Loc | undefined {
	const leftParenthesisPos = findLastNonWhitespaceCharacterOptional(script, innerLoc.start);
	const rightParenthesisPos = findNonWhitespaceCharacterOptional(script, innerLoc.end + 1);
	if (
		leftParenthesisPos != null && rightParenthesisPos != null
		&& script[leftParenthesisPos] === '(' && script[rightParenthesisPos] === ')'
	) {
		return {
			start: leftParenthesisPos,
			end: rightParenthesisPos,
		};
	}
}
