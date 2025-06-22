// Most of this file is concerned with parsing binding strings. I don't trust regexes so we're doing this the old fashioned way.

import type { Key } from "./layers/keyboard";
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

	matches(input: string[]) {
		return true;
	}
}

export function parseBindingString(
	binding: string,
): string[][] {
	const split = splitBinding(binding);
	const groups: string[][] = []

	let curr_group: string[] = [];
	let idx = 0;
	for (let w of split) {
		const word = w.trim();
		if (word === SEPERATOR_SEQUENTIAL) {
			groups.push(curr_group);
			curr_group = [];
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
		if (c === SEPERATOR_SIMULTANEOUS) {
			split.push(currWord.trim());
			currWord = "";
			split.push(SEPERATOR_SIMULTANEOUS)
			continue
		}
		if (c === SEPERATOR_SEQUENTIAL) {
			split.push(currWord.trim());
			currWord = "";
			split.push(SEPERATOR_SEQUENTIAL);
			continue;
		}

		currWord += c;
	}

	if (currWord.length > 0) {
		split.push(currWord);
	}

	return split
}

/** Internal function to split a binding string by +s with escaping for multiple plusses.
 * This function is only used for non physical key names (e.g. D vs KeyD), because with physical key names
 * + is a ShiftLeft/ShiftRight and an Equal*/
export function splitBindingStringEscaped(binding: string): string[] {
	const split = [];
	let word = "";
	for (let i = 0; i < binding.length; i++) {
		const c = binding[i];
		if (c === "+") {
			if (word.length > 0) {
				split.push(word);
				word = "";
			}
			// If the next character exists and is also a +, then add one to the split array (escaped)
			if (binding[i + 1] === "+") {
				split.push("+");
				//Increment i again because we have already handled the next char
				i++;
			}
			continue;
		}
		word += c;
	}

	if (word.length > 0) {
		split.push(word);
	}

	return split;
}

export function createBinding(
	binding: string,
	fn: BindingFn,
): Binding | undefined {
	const bindingGroups = parseBindingString(binding);

	return new Binding(bindingGroups, fn)
}
