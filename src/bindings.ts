import type { Key } from "./layers/keyboard";
import { arrayContainsOrd } from "./util";

export type BindingFn = () => void;

export interface IBinding {
	fn: BindingFn,
	matches: (input: Key[]) => boolean
}

export class Binding implements IBinding {
	fn: BindingFn;
	value?: number;
	sequential: boolean = false;
	keys: string[];
	name?: string;

	constructor(keys: string[], fn: BindingFn, name?: string) {
		this.keys = keys;
		this.fn = fn;
		this.name = name
	}

	matches(input: Key[]) {
		return arrayContainsOrd(input.map((k) => k.code), this.keys)
	}
}

export function parseBindingString(binding: string, physical: boolean = true): Key[] {
	const inputs: Key[] = []
	let split: string[];
	if (physical) {
		split = binding.split("+").filter((s) => s.length > 0)
	} else {
		// Split the binding string and filter out any empty sections
		split = splitBindingStringEscaped(binding).filter((s) => s.length > 0);
	}

	split.forEach((s) => {
		if (physical) {
			inputs.push({ code: s })
		} else {
			inputs.push({ key: s })
		}
	})

	return inputs
}

/** Internal function to split a binding string by +s with escaping for multiple plusses. 
 * This function is only used for non physical key names (e.g. D vs KeyD), because with physical key names
 * + is a ShiftLeft/ShiftRight and an Equal*/
export function splitBindingStringEscaped(binding: string): string[] {
	let split = []
	let word = ""
	for (let i = 0; i < binding.length; i++) {
		let c = binding[i];
		if (c === "+") {
			if (word.length > 0) {
				split.push(word)
				word = ""
			}
			// If the next character exists and is also a +, then add one to the split array (escaped)
			if (binding[i + 1] === "+") {
				split.push('+')
				//Increment i again because we have already handled the next char
				i++
			}
			continue
		}
		word += c
	}

	if (word.length > 0) {
		split.push(word)
	}

	return split;
}

export function createBinding(binding: string, fn: BindingFn, name?: string): Binding | undefined {
	let keys = splitBindingStringEscaped(binding);
	return new Binding(keys, fn, name);
}










