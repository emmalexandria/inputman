import { Binding, createBinding, type BindingFn } from "./bindings";
import { KeyboardLayer } from "./layers/keyboard";
import { MouseLayer } from "./layers/mouse";

export type InputEventCallback = (event: InputEvent) => void;
export type ScrollCallback = (event: Event) => void;

export interface InputManConfig {
	preventsDefault?: boolean;
	maxSequenceLength?: number;
	sequenceTimer?: number;
}

export interface Input {
	input: string;
	press: boolean;
}

export class InputMan {
	keyboard: KeyboardLayer;
	mouse: MouseLayer;

	private inputs: Array<Input> = [];

	private preventsDefault: boolean;
	private pressedInputs: Set<Input> = new Set();
	inputSequence: Array<Input> = [];
	private sequenceTimer: number;
	private maxSequenceLength: number;
	private bindings: Set<Binding> = new Set();

	constructor(target: Window | HTMLElement, config?: InputManConfig) {
		this.preventsDefault = config?.preventsDefault ?? true;
		this.maxSequenceLength = config?.maxSequenceLength ?? 5;
		this.sequenceTimer = config?.sequenceTimer ?? 200;

		this.keyboard = new KeyboardLayer(this, target, config?.maxSequenceLength);
		this.mouse = new MouseLayer(this, target);
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
		const { sequential, consecutive } = Array.from(this.bindings).reduce(
			(accumulator, curr) => {
				if (curr.sequential) {
					accumulator.sequential.push(curr);
				} else {
					accumulator.consecutive.push(curr);
				}
				return accumulator;
			},
			{ sequential: new Array<Binding>(), consecutive: new Array<Binding>() },
		);

		for (const binding of consecutive) {
			if (binding.matches(Array.from(this.pressedInputs))) {
				binding.fn();
			}
		}

		for (const binding of sequential) {
			if (binding.matches(this.inputSequence)) {
				binding.fn();
			}
		}
	}

	maybePreventDefault(ev: Event): boolean {
		if (this.preventsDefault) ev.preventDefault();
		return this.preventsDefault;
	}

	pressInput(name: Input) {
		this.pressedInputs.add(name);
		this.invokeBindings();
	}

	releaseInput(name: Input) {
		this.pressedInputs.delete(name);
		this.addToSequence(name);
		this.invokeBindings();
	}

	private addToSequence(input: Input) {
		this.inputSequence.push(input);
		const idx = this.inputSequence.length - 1;
		setTimeout(() => {
			this.inputSequence.splice(idx, 1);
		}, this.sequenceTimer);
		if (this.inputSequence.length > this.maxSequenceLength) {
			this.inputSequence = this.inputSequence.slice(
				this.inputSequence.length - this.maxSequenceLength,
				this.inputSequence.length,
			);
		}
	}
}
