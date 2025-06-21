import { createBinding, type BindingFn, type IBinding } from "./bindings";
import { getMouseButtonName, InputInterceptor, InputState, type InputReceiver, type Key } from "./input";
import { KeyboardLayer } from "./layers/keyboard";
import type { Vector2 } from "./types";




export type InputEventCallback = (event: InputEvent) => void;
export type ScrollCallback = (event: Event) => void;

export interface ButtonEvent {
	code: string
	up: boolean
}

export interface MoveEvent {
	delta: Vector2
	current: Vector2
}

export interface InputEvent {
	button?: ButtonEvent,
	move?: MoveEvent,
	shift: boolean,
	ctrl: boolean,
	alt: boolean,
	meta: boolean
}

export interface InputManConfig {
	preventsDefault?: boolean;
	maxSequenceLength?: number
}


export class InputMan implements InputReceiver {
	private preventsDefault: boolean;
	private interceptor: InputInterceptor;
	private keyboard: KeyboardLayer;
	private state: InputState;
	private bindings: Set<IBinding> = new Set();
	private keyboardCallbacks: Set<InputEventCallback> = new Set();
	private mouseCallbacks: Set<InputEventCallback> = new Set();
	private scrollCallbacks: Set<ScrollCallback> = new Set();

	constructor(target: Window | HTMLElement, config?: InputManConfig) {
		this.preventsDefault = config?.preventsDefault ?? true;
		this.interceptor = new InputInterceptor(this, target, config?.preventsDefault ?? false)
		this.state = new InputState(config?.maxSequenceLength);
		this.keyboard = new KeyboardLayer(this, target, config?.maxSequenceLength);
	}

	isPressed = (code: string) => this.state.isPressed({ code })
	isPressedKey = (key: string) => this.state.isPressedKey({ key })

	registerBinding(binding: string, fn: BindingFn): boolean {
		const bindingObj = createBinding(binding, fn);
		if (bindingObj) {
			this.bindings.add(bindingObj);
			return true;
		}

		return false;
	}

	registerButtonCallback(callback: InputEventCallback) {
		this.keyboardCallbacks.add(callback);
	}

	registerMouseCallback(callback: InputEventCallback) {
		this.mouseCallbacks.add(callback)
	}

	private invokeCallbacks(ev: InputEvent) {
		// Call bindings
		for (let binding of this.bindings) {
			if (binding.matches(Array.from(this.state.getPressedKeys()))) {
				binding.fn()
			}
		}

		for (let callback of this.keyboardCallbacks) {
			callback(ev)
		}
	}

	private invokeMouseCallbacks(ev: InputEvent) {
		for (let callback of this.mouseCallbacks) {
			callback(ev)
		}
	}

	private invokeScrollCallbacks(ev: Event) {
		for (let callback of this.scrollCallbacks) {
			callback(ev)
		}
	}


	keyboardDown(ev: KeyboardEvent) {
		this.state.addPressedKey({ code: ev.code, key: ev.key });
		this.invokeCallbacks(this.createKeyEvent(ev, false));
	}

	keyboardUp(ev: KeyboardEvent) {
		const key: Key = { key: ev.key, code: ev.code }
		this.state.addKeyToSequence(key);
		this.state.removePressedKey(key);
		// Remove keys from key sequence from start if over max length
		this.state.cullKeySequence()

	}

	mouseMove(ev: MouseEvent) {
		const event = this.createMouseMoveEvent(ev)
		this.state.updateMouse(ev);
		this.invokeMouseCallbacks(event)
	}

	mouseDown(ev: MouseEvent) {
		const button = getMouseButtonName(ev.button);
		this.state.addPressedKey({ code: button, key: button })
		this.invokeCallbacks(this.createMouseBtnEvent(ev, false))
	}

	mouseUp(ev: MouseEvent) {
		const button = getMouseButtonName(ev.button);
		this.state.removePressedKey({ key: button, code: button });

		this.state.cullKeySequence();
	}

	mouseScroll(ev: Event) {
		this.invokeScrollCallbacks(ev);
	};

	touchStart(ev: TouchEvent) {

	}

	touchEnd(ev: TouchEvent) {

	}

	touchMove(ev: TouchEvent) {

	}

	private createKeyEvent(ev: KeyboardEvent, up: boolean): InputEvent {
		const event: InputEvent = {
			button: { code: ev.code, up },
			shift: ev.shiftKey,
			ctrl: ev.ctrlKey,
			alt: ev.altKey,
			meta: ev.metaKey
		}

		return event
	}

	private createMouseBtnEvent(ev: MouseEvent, up: boolean): InputEvent {
		const button = getMouseButtonName(ev.button);
		const event: InputEvent = {
			button: { code: button, up },
			shift: ev.shiftKey,
			ctrl: ev.ctrlKey,
			alt: ev.altKey,
			meta: ev.metaKey

		}

		return event;
	}

	private createMouseMoveEvent(ev: MouseEvent): InputEvent {
		const event: InputEvent = {
			move: { delta: { x: ev.movementX, y: ev.movementY }, current: { x: ev.pageX, y: ev.pageY } },
			shift: ev.shiftKey,
			ctrl: ev.ctrlKey,
			alt: ev.altKey,
			meta: ev.metaKey
		}

		return event
	}

	maybePreventDefault(ev: Event): boolean {
		if (this.preventsDefault) ev.preventDefault();
		return this.preventsDefault;
	}

}
