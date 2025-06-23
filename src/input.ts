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

	/** Converts the input sequence to a binding descriptor for use with matching bindings */
	//This is a really simple algorithm, but it was quite a pain in the ass to implement so it'll be commented extensively
	toBindingDescriptor(numGroups: number): BindingDescriptor {
		// The final result we return
		const result: BindingDescriptor = [];
		// The list of held keys
		const held: Set<string> = new Set();
		// Whether the last input was a press or unpress
		let lastPressed: boolean = false;

		for (const input of this._inputSequence) {
			// Add to held if its a press
			if (input.press) {
				held.add(input.name);
				lastPressed = true;
			} else {
				// If held is not emtpy and the last is not pressed, we add the held keys to the result
				// We only do if if the last was a press to prevent releasing multiple keys causing random groups
				if (held.size > 0 && lastPressed) {
					result.push([...held]);
				}
				held.delete(input.name);
				lastPressed = false
			}
		}

		// Last push because we may not encounter a key unpress at thet end
		if (held.size > 0) {
			result.push([...held])
		}

		// Return only the last slice of the result that we care about (matches the length of the binding)
		return result.slice(result.length - numGroups);
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
