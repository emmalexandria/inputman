// Most of this file is concerned with parsing binding strings. I don't trust regexes so we're doing this the old fashioned way.

import { arrayEqual2d } from "./util";

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
	descriptor: BindingDescriptor;

	constructor(
		descriptor: BindingDescriptor,
		fn: BindingFn,
	) {
		this.descriptor = descriptor;
		this.fn = fn;
	}

	matches(input: BindingDescriptor) {
		return arrayEqual2d(input, this.descriptor);
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
