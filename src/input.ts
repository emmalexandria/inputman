import type { BindingDescriptor } from "./bindings";
import { cullSequence } from "./util";

export interface Modifiers {
	shift: boolean;
	ctrl: boolean;
	alt: boolean;
	meta: boolean;
}

export interface Input<T> {
	/** The input triggered */
	input: T;
	/** Whether it was a press or release */
	press?: boolean;
	name: string;
}

/** Describes the configuration for the input class */
export interface InputConfig {
	/** How long inputs remain in the release and input sequence */
	releaseSequenceTimer?: number;
	/** The maximum number of inputs in the release sequence */
	maxReleaseSequenceLength?: number;
	/** The maximum length of the full sequence of both pressed keys and releases */
	maxInputSequenceLength?: number;
}

/** This class is used internally by both the input manager and the input layers to keep track of the sequence of inputs,
 * currently pressed inputs, and the sequence in which inputs were released. It also provides code for converting
 * the sequence of inputs into binding descriptors for binding matches.*/
export class Inputs<T> {
	private _inputSequence: Array<Input<T>> = [];
	private _pressedInputs: Set<T> = new Set();
	private _releaseSequence: Array<T> = [];

	private releaseTimer: number;
	private maxReleaseSequenceLength: number;
	private maxInputSequenceLength: number;

	constructor(config?: InputConfig) {
		this.releaseTimer = config?.releaseSequenceTimer ?? 500;
		this.maxReleaseSequenceLength = config?.maxReleaseSequenceLength ?? 5;
		this.maxInputSequenceLength = config?.maxInputSequenceLength ?? 10;
	}

	get inputSequence() {
		return this._inputSequence;
	}

	get pressedInputs() {
		return this._pressedInputs;
	}

	get releasedSequence() {
		return this._releaseSequence;
	}

	isPressed(input: T) {
		return this.pressedInputs.has(input);
	}

	press(input: Input<T>) {
		input.press = true;
		this._pressedInputs.add(input.input);
		this._inputSequence.push(input);

		this.cullSequences();
	}

	unpress(input: Input<T>) {
		input.press = false;
		this._pressedInputs.delete(input.input);
		this._inputSequence.push(input);

		this._releaseSequence.push(input.input);
		setTimeout(() => {
			const idx = this._releaseSequence.findIndex((i) => i === input);
			this._releaseSequence.slice(idx);
		}, this.releaseTimer);

		this.cullSequences();
	}

	consume(input: Input<T>[]) {
		for (const i of input) {
			const idx = this._inputSequence.findIndex((item) => item === i);
			if (idx) {
				this._inputSequence.splice(idx, 1);
			}
		}
	}

	toBindingDescriptor(num: number = -1): BindingDescriptor {
		const result: BindingDescriptor = [];
		const held: Set<string> = new Set();
		let lastGroup: string[] | null = null

		let inputSequence = this._inputSequence;
		if (num > 0) {
			inputSequence = this._inputSequence.slice(this._inputSequence.length - num);
		}

		for (const input of inputSequence) {
			if (input.press) {
				held.add(input.name);

				result.push([...held])

			} else {
				held.delete(input.name);
			}
		}

		return result;
	}

	private cullSequences() {
		this._inputSequence = cullSequence(
			this._inputSequence,
			this.maxInputSequenceLength,
		);
		this._releaseSequence = cullSequence(
			this._releaseSequence,
			this.maxReleaseSequenceLength,
		);
	}
}
