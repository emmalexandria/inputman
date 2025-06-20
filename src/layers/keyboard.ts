import type { InputMan } from "../manager";
import { addWindowEventListener } from "../util";

export interface Key {
	/// The character of the key, including modifiers like shift
	key?: string;
	/// The physical location of the key (based on U.S. QWERTY layout)
	code?: string;
}

export type KeyboardCallbackFn = (ev: KeyboardEvent) => void;
export type KeyboardCallbackType = "keydown" | "keyup";

interface KeyboardCallback {
	type: KeyboardCallbackType,
	fn: KeyboardCallbackFn
}

export class KeyboardLayer {
	private manager: InputMan;
	private callbacks: Array<KeyboardCallback> = new Array();
	private pressedKeys: Set<Key> = new Set();
	private keySequence: Array<Key> = new Array();
	private maxSequenceLength: number;

	constructor(manager: InputMan, target: HTMLElement | Window, maxSequenceLength = 5) {
		this.manager = manager;
		this.maxSequenceLength = maxSequenceLength;

		this.keyDown = this.keyDown.bind(this);
		this.keyUp = this.keyUp.bind(this);

		if (target instanceof Window) {
			addWindowEventListener("keydown", this.keyDown);
			addWindowEventListener("keyup", this.keyUp);
		} else if (target instanceof HTMLElement) {
			target.addEventListener("keydown", this.keyDown);
			target.addEventListener("keyup", this.keyUp);
		}
	}

	/** Check if a key is pressed by both code and key */
	isPressed(key: Key): boolean {
		return Array.from(this.pressedKeys).find((k) => k === key) ? true : false;
	}

	/** Check if a key is pressed by key only */
	isPressedKey(key: string): boolean {
		return Array.from(this.pressedKeys).find((k) => k.key === key) ? true : false;
	}

	/** Check if a key is pressed by code only */
	isPressedCode(code: string): boolean {
		return Array.from(this.pressedKeys).find((k) => k.code === code) ? true : false;
	}

	/** Pressed keys track the currently held keys (added on keydown, removed on keyup) */
	getPressedKeys(): Set<Key> {
		return this.pressedKeys;
	}

	/** The key sequence is the list of keys pressed in order, intended for sequential bindings instead of 
	* combinatorial bindings. Keys are added on keyup, removed when the length of the recorded seqeunce
	* exceeds the maximum length */
	getKeySequence(): Array<Key> {
		return this.keySequence;
	}

	private invokeCallbacks(ev: KeyboardEvent, type: KeyboardCallbackType) {
		const filtered = this.callbacks.filter((c) => c.type === type);
		filtered.forEach((cb) => cb.fn(ev));
	}

	registerCallback(cb: KeyboardCallbackFn, type: KeyboardCallbackType = "keydown") {
		this.callbacks.push({
			fn: cb,
			type
		});
	}

	removeCallback(cb: KeyboardCallback) {
		this.callbacks = this.callbacks.filter((c) => c !== cb);
	}

	private keyDown(ev: KeyboardEvent) {
		this.manager.maybePreventDefault(ev);
		this.pressedKeys.add({ key: ev.key, code: ev.code });
		this.invokeCallbacks(ev, "keydown");
		this.manager.pressInput(ev.code);
	}

	private keyUp(ev: KeyboardEvent) {
		this.manager.maybePreventDefault(ev);
		this.pressedKeys.delete({ key: ev.key, code: ev.code });
		this.keySequence.push({ key: ev.key, code: ev.code });
		this.invokeCallbacks(ev, "keyup");
		this.cullKeySequence();
		this.manager.releaseInput(ev.code);
	}

	private cullKeySequence() {
		if (this.keySequence.length > this.maxSequenceLength) {
			this.keySequence = this.keySequence.slice(this.keySequence.length - this.maxSequenceLength, this.keySequence.length)
		}
	}
}
