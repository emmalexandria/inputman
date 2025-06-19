import { createBinding, type BindingFn, type IBinding } from "./bindings";

// Nasty little hack required because addEventListener on window doesn't infer the correct event type
function addWindowEventListener<K extends keyof WindowEventMap>(
	type: K,
	listener: (this: Window, ev: WindowEventMap[K]) => any
) {
	window.addEventListener(type, listener);
}


export type KeyEventCallback = (event: KeyEvent) => void;

export interface KeyEvent {
	key: string;
	keyCode: string;
	up: boolean;
	shift: boolean,
	ctrl: boolean,
	alt: boolean,
	meta: boolean
}


export class InputMan {
	private pressedKeys: Set<string> = new Set();
	private keySequence: string[] = [];
	private bindings: Set<IBinding> = new Set();
	private keyboardCallbacks: Set<KeyEventCallback> = new Set();

	constructor() {
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);

		addWindowEventListener("keydown", this.handleKeyDown);
		addWindowEventListener("keyup", this.handleKeyUp);

		addWindowEventListener("mousemove", this.handleMouseMove);
		addWindowEventListener("mousedown", this.handleMouseDown);
	}

	isPressed(key: string): boolean {
		return this.pressedKeys.has(key)
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
				binding.fn()
			}
		}

		for (let callback of this.keyboardCallbacks) {
			callback(ev)
		}
	}

	private handleKeyDown(ev: KeyboardEvent) {
		ev.preventDefault();
		const normalized = InputMan.normalizeKey(ev)
		this.pressedKeys.add(normalized)
		this.invokeCallbacks(this.createKeyEvent(ev, false))
	}

	private handleKeyUp(ev: KeyboardEvent) {
		ev.preventDefault();
		const normalized = InputMan.normalizeKey(ev);
		this.pressedKeys.delete(normalized)
		this.keySequence.push(normalized)
		this.invokeCallbacks(this.createKeyEvent(ev, true))
	}

	private handleMouseMove(ev: MouseEvent) {
		ev.preventDefault();

	}

	private handleMouseDown(ev: MouseEvent) {
		ev.preventDefault();
	}

	private static normalizeKey(ev: KeyboardEvent) {
		return ev.code
	}

	private createKeyEvent(ev: KeyboardEvent, up: boolean): KeyEvent {
		const event: KeyEvent = {
			keyCode: ev.code,
			key: ev.key,
			up,
			shift: ev.shiftKey,
			ctrl: ev.ctrlKey,
			alt: ev.altKey,
			meta: ev.metaKey
		}

		return event
	}
}
