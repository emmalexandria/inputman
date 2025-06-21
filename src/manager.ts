import { createBinding, type BindingFn, type IBinding } from "./bindings";
import { KeyboardLayer } from "./layers/keyboard";
import { MouseLayer } from "./layers/mouse";
import type { Vector2 } from "./types";




export type InputEventCallback = (event: InputEvent) => void;
export type ScrollCallback = (event: Event) => void;

export interface InputManConfig {
	preventsDefault?: boolean;
	maxSequenceLength?: number
}

type Input = string;

export class InputMan {
	keyboard: KeyboardLayer;
	mouse: MouseLayer;

	private preventsDefault: boolean;
	private pressedInputs: Set<Input> = new Set();
	private inputSequence: Array<Input> = new Array();
	private maxSequenceLength: number;
	private bindings: Set<IBinding> = new Set();

	constructor(target: Window | HTMLElement, config?: InputManConfig) {
		this.preventsDefault = config?.preventsDefault ?? true;
		this.maxSequenceLength = config?.maxSequenceLength ?? 5;

		this.keyboard = new KeyboardLayer(this, target, config?.maxSequenceLength);
		this.mouse = new MouseLayer(this, target)
	}

	registerBinding(binding: string, fn: BindingFn): boolean {
		const bindingObj = createBinding(binding, fn);
		if (bindingObj) {
			this.bindings.add(bindingObj);
			return true;
		}

		return false;
	}

	private invokeBindings() {
		for (let binding of this.bindings) {
			if (binding.matches(Array.from(this.pressedInputs))) {
				binding.fn()
			}
		}
	}

	maybePreventDefault(ev: Event): boolean {
		if (this.preventsDefault) ev.preventDefault();
		return this.preventsDefault;
	}

	pressInput(name: Input) {
		this.pressedInputs.add(name);
		this.invokeBindings()
	}

	releaseInput(name: Input) {
		this.pressedInputs.delete(name);
		this.inputSequence.push(name);
		if (this.inputSequence.length > this.maxSequenceLength) {
			this.inputSequence = this.inputSequence.slice(this.inputSequence.length - this.maxSequenceLength, this.inputSequence.length);
		}
	}
}
