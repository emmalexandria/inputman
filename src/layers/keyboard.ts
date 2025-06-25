import { Inputs, type Input, type Modifiers } from "../input";
import type { InputMan } from "../manager";
import { addWindowEventListener } from "../util";

export interface Key {
	/// The character of the key, including modifiers like shift
	key?: string;
	/// The physical location of the key (based on U.S. QWERTY layout)
	code?: string;
}

export class KeyInput implements Input<Key> {
	input: Key;
	press?: boolean;
	name: string;

	constructor(key: Key, press?: boolean, name?: string) {
		this.input = key;
		this.press = press;
		if (name) {
			this.name = name;
		} else {
			this.name = key.code ?? key.key ?? "unknown";
		}
	}
}

export interface KeyboardLayerEvent {
	key: Key;
	modifiers: Modifiers;
}

export type KeyboardCallbackFn = (ev: KeyboardLayerEvent) => void;
export type KeyboardCallbackType = "keydown" | "keyup";

interface KeyboardCallback {
	type: KeyboardCallbackType;
	fn: KeyboardCallbackFn;
	repeat: boolean
}

export class KeyboardLayer {
	private manager?: InputMan;
	private callbacks: Array<KeyboardCallback> = [];
	private inputs: Inputs<Key>;

	constructor(
		target: HTMLElement | Window,
		manager?: InputMan,
		maxSequenceLength = 5,
	) {
		this.manager = manager;

		this.inputs = new Inputs({
			maxInputSequenceLength: maxSequenceLength,
			maxReleaseSequenceLength: maxSequenceLength,
		});

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
		return this.inputs.pressedInputs.has(key);
	}

	/** Check if a key is pressed by key only */
	isPressedKey(key: string): boolean {
		return Array.from(this.inputs.pressedInputs).find((k) => k.key === key)
			? true
			: false;
	}

	/** Check if a key is pressed by code only */
	isPressedCode(code: string): boolean {
		return Array.from(this.inputs.pressedInputs).find((k) => k.code === code)
			? true
			: false;
	}

	/** Pressed keys track the currently held keys (added on keydown, removed on keyup) */
	getPressedKeys(): Set<Key> {
		return this.inputs.pressedInputs;
	}

	/** The key sequence is the list of keys pressed in order, intended for sequential bindings instead of
	 * combinatorial bindings. Keys are added on keyup, removed when the length of the recorded seqeunce
	 * exceeds the maximum length */
	getKeySequence(): Array<Key> {
		return this.inputs.releasedSequence;
	}

	private invokeCallbacks(ev: KeyboardEvent, type: KeyboardCallbackType) {
		const event: KeyboardLayerEvent = {
			key: { code: ev.code, key: ev.key },
			modifiers: {
				shift: ev.shiftKey,
				alt: ev.altKey,
				ctrl: ev.ctrlKey,
				meta: ev.metaKey,
			},
		};
		const filtered = this.callbacks.filter((c) => c.type === type);
		filtered.forEach((cb) => cb.fn(event));
	}

	registerCallback(
		cb: KeyboardCallbackFn,
		type: KeyboardCallbackType = "keydown",
		repeat: boolean = true
	) {
		this.callbacks.push({
			fn: cb,
			type,
			repeat
		});
	}

	removeCallback(cb: KeyboardCallbackFn, type: KeyboardCallbackType = "keydown", repeat: boolean = true) {
		this.callbacks = this.callbacks.filter((c) => {
			return !(c.fn === cb && c.type === type && c.repeat === repeat)
		});
	}

	private keyDown(ev: KeyboardEvent) {
		this.manager?.maybePreventDefault(ev);
		this.invokeCallbacks(ev, "keydown");
		this.inputs.press({ input: { key: ev.key, code: ev.code }, name: ev.code });
		this.manager?.pressInput(ev.code);
	}

	private keyUp(ev: KeyboardEvent) {
		this.manager?.maybePreventDefault(ev);
		this.invokeCallbacks(ev, "keyup");
		this.inputs.unpress({
			input: { key: ev.key, code: ev.code },
			name: ev.code,
		});
		this.manager?.releaseInput(ev.code);
	}
}
