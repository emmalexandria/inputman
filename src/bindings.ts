import type { Key } from "./layers/keyboard";
import { arrayContainsOrd } from "./util";

const SEPERATOR_CHAR = "+";
const SEPERATOR_SEQUENTIAL = ">";
const GROUPING_LEFT = "{";
const GROUPING_RIGHT = "}";

type BSection = string[];
type BSeperator = "simultaneous" | "sequential";


export type BindingFn = () => void;

export class Binding {
	fn: BindingFn;
	value?: number;
	sequential: boolean = false;
	keys: string[];
	name?: string;

	constructor(
		keys: string[],
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
		return arrayContainsOrd(input, this.keys);
	}
}

function cleanBindingCode(b: string): string {
	return b.trim();
}

export function parseBindingString(
	binding: string,
	physical: boolean = true,
): Key[] {
	const inputs: Key[] = [];
	let split: string[];
	if (physical) {
		split = binding.split("+").filter((s) => s.length > 0);
	} else {
		// Split the binding string and filter out any empty sections
		split = splitBindingStringEscaped(binding).filter((s) => s.length > 0);
	}

	split.forEach((s) => {
		const cleaned = cleanBindingCode(s)
		if (physical) {
			inputs.push({ code: cleaned });
		} else {
			inputs.push({ key: cleaned });
		}
	});

	return inputs;
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
	binding: string | string[],
	fn: BindingFn,
	name?: string,
): Binding | undefined {
	if (typeof binding === "string") {
		const keys = splitBindingStringEscaped(binding);
		return new Binding(keys, fn, false, name);
	}

	if (typeof binding === "object") {
		return new Binding(binding, fn, true, name);
	}
}
