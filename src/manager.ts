import { createBinding, type BindingFn, type IBinding } from "./bindings";
import { getMouseButtonName, type Key } from "./input";
import type { Vector2 } from "./types";

// Nasty little hack required because addEventListener on window doesn't infer the correct event type
function addWindowEventListener<K extends keyof WindowEventMap>(
	type: K,
	listener: (this: Window, ev: WindowEventMap[K]) => any
) {
	window.addEventListener(type, listener);
}


export type InputEventCallback = (event: InputEvent) => void;

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


export class InputMan {
	private pressedKeys: Set<Key> = new Set();
	private keySequence: Key[] = [];
	private maxSequenceLength;
	private bindings: Set<IBinding> = new Set();
	private keyboardCallbacks: Set<InputEventCallback> = new Set();
	private mouseCallbacks: Set<InputEventCallback> = new Set();
	private preventsDefault: boolean;

	constructor(config?: InputManConfig) {
		this.preventsDefault = config?.preventsDefault ?? false;
		this.maxSequenceLength = config?.maxSequenceLength ?? 5;

		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);

		addWindowEventListener("keydown", this.handleKeyDown);
		addWindowEventListener("keyup", this.handleKeyUp);

		addWindowEventListener("mousemove", this.handleMouseMove);
		addWindowEventListener("mousedown", this.handleMouseDown);
		addWindowEventListener("mouseup", this.handleMouseUp);
	}

	isPressedCode(keyCode: string): boolean {
		return Array.from(this.pressedKeys).find((k) => k.code === keyCode) ? true : false
	}

	isPressedKey(key: string): boolean {
		return Array.from(this.pressedKeys).find((k) => k.key === key) ? true : false
	}

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
			if (binding.matches(Array.from(this.pressedKeys))) {
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


	private handleKeyDown(ev: KeyboardEvent) {
		if (this.preventsDefault) ev.preventDefault();

		this.pressedKeys.add({ key: ev.key, code: ev.code })
		this.invokeCallbacks(this.createKeyEvent(ev, false))
	}

	private handleKeyUp(ev: KeyboardEvent) {
		if (this.preventsDefault) ev.preventDefault();

		this.pressedKeys.delete({ key: ev.key, code: ev.code })
		this.keySequence.push({ key: ev.key, code: ev.code })
		// Remove keys from key sequence from start if over max length
		if (this.keySequence.length > this.maxSequenceLength) {
			this.keySequence = this.keySequence.slice(this.keySequence.length - this.maxSequenceLength, this.keySequence.length)
		}
	}

	private handleMouseMove(ev: MouseEvent) {
		if (this.preventsDefault) ev.preventDefault();

		const event = this.createMouseMoveEvent(ev)
		this.invokeMouseCallbacks(event)
	}

	private handleMouseDown(ev: MouseEvent) {
		if (this.preventsDefault) ev.preventDefault();

		const button = getMouseButtonName(ev.button);
		this.pressedKeys.add({ code: button, key: button })
		this.invokeCallbacks(this.createMouseBtnEvent(ev, false))
	}

	private handleMouseUp(ev: MouseEvent) {
		if (this.preventsDefault) ev.preventDefault()

		const button = getMouseButtonName(ev.button);
		this.pressedKeys.delete({ code: button, key: button });
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

}
