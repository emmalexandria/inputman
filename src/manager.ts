import { createBinding, type BindingFn, type IBinding } from "./bindings";
import type { Key } from "./input";

// Nasty little hack required because addEventListener on window doesn't infer the correct event type
function addWindowEventListener<K extends keyof WindowEventMap>(
	type: K,
	listener: (this: Window, ev: WindowEventMap[K]) => any
) {
	window.addEventListener(type, listener);
}


export type KeyEventCallback = (event: KeyEvent) => void;


export interface KeyEvent {
	key: Key;
	up: boolean;
	shift: boolean,
	ctrl: boolean,
	alt: boolean,
	meta: boolean
}


export class InputMan {
	private pressedKeys: Set<Key> = new Set();
	private keySequence: string[] = [];
	private bindings: Set<IBinding> = new Set();
	private keyboardCallbacks: Set<KeyEventCallback> = new Set();
	private preventsDefault: boolean;

	constructor(preventsDefault = true) {
		this.preventsDefault = preventsDefault;

		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);

		addWindowEventListener("keydown", this.handleKeyDown);
		addWindowEventListener("keyup", this.handleKeyUp);

		addWindowEventListener("mousemove", this.handleMouseMove);
		addWindowEventListener("mousedown", this.handleMouseDown);
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

	registerKeyboardCallback(callback: KeyEventCallback) {
		this.keyboardCallbacks.add(callback);
	}

	private invokeCallbacks(ev: KeyEvent) {
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

		const normalized = InputMan.normalizeKey(ev)
		this.pressedKeys.add({ key: ev.key, code: ev.code })
		this.invokeCallbacks(this.createKeyEvent(ev, false))
	}

	private handleKeyUp(ev: KeyboardEvent) {
		if (this.preventsDefault) ev.preventDefault();

		const normalized = InputMan.normalizeKey(ev);
		this.pressedKeys.delete({ key: ev.key, code: ev.code })
		this.keySequence.push(normalized)
		this.invokeCallbacks(this.createKeyEvent(ev, true))
	}

	private handleMouseMove(ev: MouseEvent) {
		if (this.preventsDefault) ev.preventDefault();

	}

	private handleMouseDown(ev: MouseEvent) {
		if (this.preventsDefault) ev.preventDefault();

	}

	private static normalizeKey(ev: KeyboardEvent) {
		return ev.code
	}

	private createKeyEvent(ev: KeyboardEvent, up: boolean): KeyEvent {
		const event: KeyEvent = {
			key: { key: ev.key, code: ev.code },
			up,
			shift: ev.shiftKey,
			ctrl: ev.ctrlKey,
			alt: ev.altKey,
			meta: ev.metaKey
		}

		return event
	}
}
