// Most of this file is concerned with parsing binding strings. I don't trust regexes so we're doing this the old fashioned way.

import type { Key } from "./layers/keyboard";
import type { Input } from "./manager";
import { arrayContainsOrd } from "./util";

const SEPERATOR_SIMULTANEOUS = "+";
const SEPERATOR_SEQUENTIAL = ">";

type BSeperator = "simultaneous" | "sequential";

export type BindingFn = () => void;

export class Binding {
	fn: BindingFn;
	value?: number;
	sequential: boolean = false;
	keys: string[][];
	name?: string;

	constructor(
		keys: string[][],
		fn: BindingFn,
		sequential: boolean = false,
		name?: string,
	) {
		this.keys = keys;
		this.fn = fn;
		this.name = name;
		this.sequential = sequential;
	}

	matches(input: Input[]) {
		return true;
	}
}

export function parseBinding(
	binding: string,
): string[][] {
	const split = splitBinding(binding);
	const groups: string[][] = []

	let curr_group: string[] = [];
	let idx = 0;
	for (let w of split) {
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

	return groups
}

export function splitBinding(binding: string): string[] {
	const split = [];
	let currWord: string = "";

	for (let c of binding) {
		if (c === SEPERATOR_SIMULTANEOUS || c === SEPERATOR_SEQUENTIAL) {
			if (currWord.length > 0) {
				split.push(currWord.trim());
				currWord = "";
			}
			split.push(c)
			continue
		}

		currWord += c;
	}

	if (currWord.length > 0) {
		split.push(currWord);
	}

	return split
}

export function createBinding(
	binding: string,
	fn: BindingFn,
): Binding | undefined {
	const bindingGroups = parseBinding(binding);

	return new Binding(bindingGroups, fn)
}
