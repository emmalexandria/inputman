import type { InputMan } from "../manager";
import { addWindowEventListener } from "../util";

export interface Key {
	/// The character of the key, including modifiers like shift
	key?: string;
	/// The physical location of the key (based on U.S. QWERTY layout)
	code?: string;
}

export type KeyboardCallback = (ev: KeyboardEvent) => void;

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
		}
	}

	invokeCallbacks(ev: KeyboardEvent) {
		this.callbacks.forEach((cb) => cb(ev));
	}

	registerCallback(cb: KeyboardCallback) {
		this.callbacks.push(cb);
	}

	removeCallback(cb: KeyboardCallback) {
		this.callbacks = this.callbacks.filter((c) => c !== cb);
	}

	keyDown(ev: KeyboardEvent) {
		this.manager.maybePreventDefault(ev);
		this.pressedKeys.add({ key: ev.key, code: ev.code });
		this.invokeCallbacks(ev);
	}

	keyUp(ev: KeyboardEvent) {
		this.manager.maybePreventDefault(ev);
		this.pressedKeys.delete({ key: ev.key, code: ev.code });
		this.keySequence.push({ key: ev.key, code: ev.code });
		this.cullKeySequence();
	}

	cullKeySequence() {
		if (this.keySequence.length > this.maxSequenceLength) {
			this.keySequence = this.keySequence.slice(this.keySequence.length - this.maxSequenceLength, this.keySequence.length)
		}
	}
}
