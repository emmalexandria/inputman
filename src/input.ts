import type { BindingDescriptor } from "./bindings";

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
	press: boolean;
}

/** Describes the configuration for the input class */
export interface InputConfig {
	/** How long inputs remain in the release and input sequence */
	releaseSequenceTimer: number,
	/** The maximum number of inputs in the release sequence */
	maxReleaseSequenceLength: number,
	/** The maximum length of the full sequence of both pressed keys and releases */
	maxInputSequenceLength: number,
}

/** This class is used internally by both the input manager and the input layers to keep track of the sequence of inputs, 
 * currently pressed inputs, and the sequence in which inputs were released. It also provides code for converting 
 * the sequence of inputs into binding descriptors for binding matches.*/
export class Inputs<T> {
	private _inputSequence: Array<Input<T>> = [];
	private _pressedInputs: Set<T> = new Set();
	private _releaseSequence: Array<T> = new Array();

	constructor() {

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

	toBindingDescriptor(): BindingDescriptor {
		return []
	}
}
