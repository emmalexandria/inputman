import { arrayContainsOrd } from "./util";

export type BindingFn = () => void;

export interface BindingElement {
	value: boolean | number;
}

export interface IBinding {
	name?: string;
	value?: number;
	isPhysical: boolean;
	matches: (input: string[]) => boolean,
	fn: BindingFn;
}

export class Binding implements IBinding {
	fn: BindingFn;
	isPhysical: boolean;
	value?: number;
	keys: string[];
	name?: string;

	constructor(keys: string[], fn: BindingFn, isPhysical = true, name?: string) {
		this.keys = keys;
		this.fn = fn;
		this.isPhysical = isPhysical;
		this.name = name
	}

	matches(input: string[]) {
		return arrayContainsOrd(input, this.keys)
	}
}

export function createBinding(binding: string, fn: BindingFn, name?: string): Binding | undefined {
	let keys = binding.split("+");
	return new Binding(keys, fn, true, name);
}

export function createBindingKey(binding: string, fn: BindingFn, name?: string): Binding | undefined {
	let keys = binding.split("+");
	return new Binding(keys, fn, false, name);
}






