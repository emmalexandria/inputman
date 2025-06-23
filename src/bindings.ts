// Most of this file is concerned with parsing binding strings. I don't trust regexes so we're doing this the old fashioned way.

import type { Key } from "./layers/keyboard";
import type { Input } from "./manager";
import { arrayContainsOrd } from "./util";

const SEPERATOR_SIMULTANEOUS = "+";
const SEPERATOR_SEQUENTIAL = ">";

type BSeperator = "simultaneous" | "sequential";

/** Internally, inputman represents bindings as a 2D array of strings in which each inner array represents a group of
 * simultaneous inputs. Multiple arrays then represent sets of simultaneous inputs connected sequentially*/
export type BindingDescriptor = string[][];

export type BindingFn = () => void;

export class Binding {
	fn: BindingFn;
	value?: number;
	keys: string[][];

	constructor(
		keys: string[][],
		fn: BindingFn,
	) {
		this.keys = keys;
		this.fn = fn;
	}

	matches(input: Input[]) {
		return true;
	}
}

export function parseBinding(binding: string): BindingDescriptor {
	const split = splitBinding(binding);
	const groups: BindingDescriptor = [];

	let curr_group: string[] = [];
	let idx = 0;
	for (const w of split) {
		const word = w.trim();
		if (word === SEPERATOR_SEQUENTIAL) {
			if (curr_group.length > 0) {
				groups.push(curr_group);
				curr_group = [];
			}
		} else if (word !== SEPERATOR_SIMULTANEOUS) {
			curr_group.push(word);
		}

		idx++;
	}

	if (curr_group.length > 0) {
		groups.push(curr_group);
	}

	return groups;
}

export function parseInputSequence(input: Input[]): BindingDescriptor {
	const ret: string[][] = [];

	return ret;
}

/** Internal function to check if one binding descriptor (converted from a series of inputs) contains another binding descriptor.
 * Used internally in bindings to check if they match the current input state */
export function inputContainsOrdered(
	outer: BindingDescriptor,
	inner: BindingDescriptor,
): boolean {
	return true;
}

export function splitBinding(binding: string): string[] {
	const split = [];
	let currWord: string = "";

	for (const c of binding) {
		if (c === SEPERATOR_SIMULTANEOUS || c === SEPERATOR_SEQUENTIAL) {
			if (currWord.length > 0) {
				split.push(currWord.trim());
				currWord = "";
			}
			split.push(c);
			continue;
		}

		currWord += c;
	}

	if (currWord.length > 0) {
		split.push(currWord);
	}

	return split;
}

export function createBinding(
	binding: string,
	fn: BindingFn,
): Binding | undefined {
	const bindingGroups = parseBinding(binding);

	return new Binding(bindingGroups, fn);
}
