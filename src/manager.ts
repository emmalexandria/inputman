import { Binding, createBinding, type BindingFn } from "./bindings";
import { Inputs } from "./input";
import { KeyboardLayer } from "./layers/keyboard";
import { MouseLayer } from "./layers/mouse";

export type InputEventCallback = (event: InputEvent) => void;
export type ScrollCallback = (event: Event) => void;

export interface InputManConfig {
	preventsDefault?: boolean;
	maxSequenceLength?: number;
	sequenceTimer?: number;
}

export class InputMan {
	keyboard: KeyboardLayer;
	mouse: MouseLayer;

	private inputs: Inputs<string>;
	private preventsDefault: boolean;
	private bindings: Set<Binding> = new Set();

	constructor(target: Window | HTMLElement, config?: InputManConfig) {
		this.preventsDefault = config?.preventsDefault ?? true;
		this.inputs = new Inputs({
			maxInputSequenceLength: config?.maxSequenceLength,
			maxReleaseSequenceLength: config?.maxSequenceLength,
			releaseSequenceTimer: config?.sequenceTimer,
		});

		this.keyboard = new KeyboardLayer(target, this, config?.maxSequenceLength);
		this.mouse = new MouseLayer(target, this);
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
		for (const binding of this.bindings) {
			if (
				binding.matches(
					this.inputs.toBindingDescriptor(binding.descriptor.length),
				)
			) {
				binding.fn();
			}
		}
	}

	maybePreventDefault(ev: Event): boolean {
		if (this.preventsDefault) ev.preventDefault();
		return this.preventsDefault;
	}

	pressInput(name: string) {
		this.inputs.press({ name, input: name });
		this.invokeBindings();
	}

	releaseInput(name: string) {
		this.inputs.unpress({ name, input: name });
		this.invokeBindings();
	}
}
