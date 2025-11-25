import { Ast } from 'aiscript.0.19.0';
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
import { replaceBreak, replaceContinue, replaceReturn } from './jumpStatement.js';
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
import type { TranspilerConfig } from '../config.js';

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

	public addNodeReplacement(node: Ast.Node, ancestors: Ast.Node[], includeEnclosingParentheses = true, parenthesesLimit?: Ast.Loc): void {
		const innerLoc = getActualLocation(node, this.script, false);
		if (includeEnclosingParentheses) {
			const outerLoc = getEnclosingParenthesesRecursive(innerLoc, this.script, parenthesesLimit) ?? innerLoc;
			this._addReplacement(
				outerLoc.start,
				outerLoc.end + 1,
				replaceNodeAndLineSeparatorsInParentheses(node, this.script, ancestors, parenthesesLimit),
			);
		} else {
			this._addReplacement(
				innerLoc.start,
				innerLoc.end + 1,
				replaceNode(node, this.script, ancestors),
			);
		}
	}

	public addNodeReplacements(nodes: Iterable<Ast.Node>, ancestors: Ast.Node[]): void {
		for (const node of nodes) {
			this.addNodeReplacement(node, ancestors);
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

export function replaceAst(ast: Ast.Node[], script: string, ancestors: Ast.Node[], config: TranspilerConfig): string {
	const replacements: readonly SliceReplacement[] = [
		...versionNotationReplacer(script, config),
		...ast.map((node) => {
			const content = replaceNodeAndLineSeparatorsInParentheses(node, script, ancestors);
			const { start, end } = getActualLocation(node, script, true);
			return { start, end: end + 1, content };
		}),
	];
	return replaceSlices(script, replacements);
}

function versionNotationReplacer(script: string, config: TranspilerConfig): SliceReplacement[] {
	if (!config.setVersionNotation) {
		return [];
	}

	const match = /(^\s*\/\/\/\s*@\s*)([A-Z0-9_.-]+)(?:[\r\n][\s\S]*)?$/i.exec(script);
	if (match == null) {
		return [{ start: 0, end: 0, content: '/// @ 1.1.0\n' }];
	}
	const start = match[1]!.length;
	const end = start + match[2]!.length;
	return [{ start, end, content: '1.1.0' }];
}

export function replaceNodeAndLineSeparatorsInParentheses(
	node: Ast.Node,
	script: string,
	ancestors: Ast.Node[],
	limit: Ast.Loc = { start: 0, end: script.length - 1 },
): string {
	const nodeLoc: Ast.Loc = getActualLocation(node, script, false);
	const parenthesisPairs = getEnclosingParenthesisPairs(nodeLoc, script, limit);

	if (parenthesisPairs.length === 0) {
		return replaceNode(node, script, ancestors);
	}

	const outerParentheses = parenthesisPairs.at(-1)!;
	const builder = new ReplacementsBuilder(script, outerParentheses.start, outerParentheses.end);
	let innerLoc = nodeLoc;
	for (const parenthesisPair of parenthesisPairs) {
		builder.addReplacement(parenthesisPair.start + 1, innerLoc.start, replaceLineSeparators);
		builder.addReplacement(innerLoc.end + 1, parenthesisPair.end, replaceLineSeparators);
		innerLoc = parenthesisPair;
	}
	builder.addNodeReplacement(node, ancestors, false);
	return builder.execute();
}

function replaceNode(
	node: Ast.Node,
	script: string,
	ancestors: Ast.Node[],
): string {
	const newAncestors = [node, ...ancestors];

	switch (node.type) {
		case 'ns': {
			return replaceNamespace(node, script, newAncestors);
		}
		case 'meta': {
			return replaceMeta(node, script, newAncestors);
		}
		case 'def': {
			return replaceDefinition(node, script, newAncestors);
		}
		case 'return': {
			return replaceReturn(node, script, newAncestors);
		}
		case 'each': {
			return replaceEach(node, script, newAncestors);
		}
		case 'for': {
			return replaceFor(node, script, newAncestors);
		}
		case 'loop': {
			return replaceLoop(node, script, newAncestors);
		}
		case 'break': {
			return replaceBreak(newAncestors);
		}
		case 'continue': {
			return replaceContinue(newAncestors);
		}
		case 'assign':
		case 'addAssign':
		case 'subAssign': {
			return replaceAssign(node, script, newAncestors);
		}
		case 'if': {
			return replaceIf(node, script, newAncestors);
		}
		case 'fn': {
			return replaceFn(node, script, newAncestors);
		}
		case 'match': {
			return replaceMatch(node, script, newAncestors);
		}
		case 'block': {
			return replaceBlock(node, script, newAncestors);
		}
		case 'exists': {
			return replaceExists(node, script, newAncestors);
		}
		case 'tmpl': {
			return replaceTmpl(node, script, newAncestors);
		}
		case 'str': {
			return replaceStr(node, script);
		}
		case 'obj': {
			return replaceObj(node, script, newAncestors);
		}
		case 'arr': {
			return replaceArr(node, script, newAncestors);
		}
		case 'not': {
			return replaceNot(node, script, newAncestors);
		}
		case 'and':
		case 'or': {
			return replaceBinaryOperation(node, script, newAncestors);
		}
		case 'identifier': {
			return replaceIdentifier(node);
		}
		case 'call': {
			return replaceCall(node, script, newAncestors);
		}
		case 'index': {
			return replaceIndex(node, script, newAncestors);
		}
		case 'prop': {
			return replaceProp(node, script, newAncestors);
		}
		case 'num':
		case 'bool':
		case 'null': {
			const loc = getActualLocation(node, script, false);
			return script.slice(loc.start, loc.end + 1);
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

export function getActualLocation(node: Ast.Node, script: string, includeEnclosingParentheses: boolean): Ast.Loc {
	if (includeEnclosingParentheses) {
		const innerLoc = getActualLocation(node, script, false);
		const enclosingParentheses = getEnclosingParenthesesRecursive(innerLoc, script);
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
				end: getActualLocation(node.right, script, true).end,
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
				end = loc.end;
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

function getEnclosingParenthesesRecursive(
	innerLoc: Ast.Loc,
	script: string,
	limit: Ast.Loc = { start: 0, end: script.length - 1 },
): Ast.Loc | undefined {
	let result;
	let currentLoc: Ast.Loc | undefined = innerLoc;
	currentLoc = getEnclosingParentheses(currentLoc, script, limit);
	while (currentLoc != null) {
		result = currentLoc;
		currentLoc = getEnclosingParentheses(currentLoc, script, limit);
	}
	return result;
}

function getEnclosingParenthesisPairs(innerLoc: Ast.Loc, script: string, limit?: Ast.Loc): Ast.Loc[] {
	const result: Ast.Loc[] = [];
	let prevLoc: Ast.Loc = innerLoc;
	let currentLoc = getEnclosingParentheses(prevLoc, script, limit);
	while (currentLoc != null) {
		result.push(currentLoc);
		prevLoc = currentLoc;
		currentLoc = getEnclosingParentheses(prevLoc, script, limit);
	}
	return result;
}

function getEnclosingParentheses(
	innerLoc: Ast.Loc,
	script: string,
	limit: Ast.Loc = { start: 0, end: script.length - 1 },
): Ast.Loc | undefined {
	const leftParenthesisPos = findLastNonWhitespaceCharacterOptional(script, innerLoc.start, limit.start);
	const rightParenthesisPos = findNonWhitespaceCharacterOptional(script, innerLoc.end + 1, limit.end + 1);
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
