import { createBinding, type BindingFn, type IBinding } from "./bindings";
import { getMouseButtonName, type Key } from "./input";

// Nasty little hack required because addEventListener on window doesn't infer the correct event type
function addWindowEventListener<K extends keyof WindowEventMap>(
	type: K,
	listener: (this: Window, ev: WindowEventMap[K]) => any
) {
	window.addEventListener(type, listener);
}


export type InputEventCallback = (event: InputEvent) => void;


export interface InputEvent {
	key: Key;
	up: boolean;
	shift: boolean,
	ctrl: boolean,
	alt: boolean,
	meta: boolean
}


export class InputMan {
	private pressedKeys: Set<Key> = new Set();
	private keySequence: Key[] = [];
	private maxSequenceLength = 10;
	private bindings: Set<IBinding> = new Set();
	private keyboardCallbacks: Set<InputEventCallback> = new Set();
	private preventsDefault: boolean;

	constructor(preventsDefault = true) {
		this.preventsDefault = preventsDefault;

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

	registerBindingString(binding: string, fn: BindingFn): boolean {
		const bindingObj = createBinding(binding, fn);
		if (bindingObj) {
			this.bindings.add(bindingObj);
			return true;
		}

		return false;
	}

	registerKeyboardCallback(callback: InputEventCallback) {
		this.keyboardCallbacks.add(callback);
	}

	private invokeCallbacks(ev: InputEvent) {
		// Call bindings
		for (let binding of this.bindings) {
			if (binding.matches(Array.from(this.pressedKeys))) {
				binding.fn(ev.key)
			}
		}

		for (let callback of this.keyboardCallbacks) {
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

	}

	private handleMouseDown(ev: MouseEvent) {
		if (this.preventsDefault) ev.preventDefault();

		const button = getMouseButtonName(ev.button);
		this.pressedKeys.add({ code: button, key: button })
		this.invokeCallbacks(this.createMouseEvent(ev, false))
	}

	private handleMouseUp(ev: MouseEvent) {
		if (this.preventsDefault) ev.preventDefault()

		const button = getMouseButtonName(ev.button);
		this.pressedKeys.delete({ code: button, key: button });
	}

	private static normalizeKey(ev: KeyboardEvent) {
		return ev.code
	}

	private createKeyEvent(ev: KeyboardEvent, up: boolean): InputEvent {
		const event: InputEvent = {
			key: { key: ev.key, code: ev.code },
			up,
			shift: ev.shiftKey,
			ctrl: ev.ctrlKey,
			alt: ev.altKey,
			meta: ev.metaKey
		}

		return event
	}

	private createMouseEvent(ev: MouseEvent, up: boolean): InputEvent {
		const button = getMouseButtonName(ev.button);
		const event: InputEvent = {
			key: { key: button, code: button },
			up,
			shift: ev.shiftKey,
			ctrl: ev.ctrlKey,
			alt: ev.altKey,
			meta: ev.metaKey

		}

		return event;
	}

}
