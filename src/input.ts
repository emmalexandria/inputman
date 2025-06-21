import { v2Zero, type Vector2 } from "./types";
import { addWindowEventListener } from "./util";


export function getMouseButtonName(button: number): string {
	switch (button) {
		case 0: return "Mouse1"
		case 1: return "Mouse3"
		case 2: return "Mouse2"
		case 3: return "Mouse4"
		case 4: return "Mouse5"
	}

	return "MouseInvalid"
}

export type MouseEventType = "move" | "click" | "scroll"

export interface InputReceiver {
	keyboardDown: (ev: KeyboardEvent) => void;
	keyboardUp: (ev: KeyboardEvent) => void;
	mouseDown: (ev: MouseEvent) => void;
	mouseUp: (ev: MouseEvent) => void;
	mouseMove: (ev: MouseEvent) => void;
	mouseScroll: (ev: Event) => void;
	touchStart: (ev: TouchEvent) => void;
	touchEnd: (ev: TouchEvent) => void;
	touchMove: (ev: TouchEvent) => void;
}

/** Nasty boilerplate class which intercepts input on an HTML element or the Window and passes it to a parent 
 * Primarily exists to keep all this boilerplate out of the input manager itself.*/
export class InputInterceptor {
	preventsDefault: boolean;
	parent: InputReceiver

	constructor(parent: InputReceiver, target: HTMLElement | Window, preventsDefault = false) {
		this.preventsDefault = preventsDefault
		this.parent = parent;

		// Have to bind our functions to maintain access to 'this'
		this.keydown = this.keydown.bind(this);
		this.keyup = this.keyup.bind(this);
		this.mousedown = this.mousedown.bind(this);
		this.mouseup = this.mouseup.bind(this);
		this.mousemove = this.mousemove.bind(this);
		this.scroll = this.scroll.bind(this);
		this.touchstart = this.touchstart.bind(this);
		this.touchend = this.touchend.bind(this);
		this.touchmove = this.touchmove.bind(this);

		if (target instanceof Window) {
			addWindowEventListener("keydown", this.keydown);
			addWindowEventListener("keyup", this.keyup);

			addWindowEventListener("mousemove", this.mousemove);
			addWindowEventListener("mousedown", this.mousedown);
			addWindowEventListener("mouseup", this.mouseup);
			addWindowEventListener("scroll", this.scroll);

			addWindowEventListener("touchstart", this.touchstart);
			addWindowEventListener("touchend", this.touchend);
			addWindowEventListener("touchmove", this.touchmove)

		} else if (target instanceof Element) {
			target.addEventListener("keydown", this.keydown);
			target.addEventListener("keyup", this.keyup);

			target.addEventListener("mousemove", this.mousemove);
			target.addEventListener("mousedown", this.mousedown);
			target.addEventListener("mouseup", this.mouseup);
			target.addEventListener("scroll", this.scroll);

			target.addEventListener("touchstart", this.touchstart);
			target.addEventListener("touchend", this.touchend);
			target.addEventListener("touchmove", this.touchmove);
		}
	}

	maybePreventDefault(ev: Event) {
		if (this.preventsDefault) ev.preventDefault()
	}

	keydown(ev: KeyboardEvent) {
		this.maybePreventDefault(ev);
		this.parent.keyboardDown(ev);
	}

	keyup(ev: KeyboardEvent) {
		this.maybePreventDefault(ev);
		this.parent.keyboardUp(ev);
	}

	mousedown(ev: MouseEvent) {
		this.maybePreventDefault(ev);
		this.parent.mouseDown(ev);
	}

	mouseup(ev: MouseEvent) {
		this.maybePreventDefault(ev);
		this.parent.mouseUp(ev);
	}
	mousemove(ev: MouseEvent) {
		this.maybePreventDefault(ev);
		this.parent.mouseMove(ev);
	}

	scroll(ev: Event) {
		this.maybePreventDefault(ev);
		this.parent.mouseScroll(ev);
	}

	touchstart(ev: TouchEvent) {
		this.maybePreventDefault(ev);
		this.parent.touchStart(ev);
	}

	touchend(ev: TouchEvent) {
		this.maybePreventDefault(ev);
		this.parent.touchEnd(ev);
	}

	touchmove(ev: TouchEvent) {
		this.maybePreventDefault(ev);
		this.parent.touchMove(ev);
	}
}

interface MouseState {
	position: Vector2,
	pagePosition: Vector2,
	screenPosition: Vector2
	lastMove: Vector2
}

/** This class manages input state such as mouse position, pressed buttons, and the sequence of key presses and releases
 * for the purpose of sequence binding */
export class InputState {
	private pressedKeys: Set<Key> = new Set();
	private keySequence: Array<Key> = new Array();
	private mouseState: MouseState;
	private maxSequenceLength: number;

	constructor(maxSequenceLength: number = 5) {
		this.maxSequenceLength = maxSequenceLength
		this.mouseState = {
			position: v2Zero(),
			lastMove: v2Zero(),
			screenPosition: v2Zero(),
			pagePosition: v2Zero()
		}
	}

	isPressed(key: Key): boolean {
		if (!key.code) return false;
		return Array.from(this.pressedKeys).find((k) => k.code === key.code) ? true : false;
	}

	isPressedKey(key: Key): boolean {
		if (!key.key) return false;
		return Array.from(this.pressedKeys).find((k) => k.key === key.key) ? true : false;
	}

	getPressedKeys(): Set<Key> {
		return this.pressedKeys
	}

	addPressedKey(key: Key) {
		this.pressedKeys.add(key);
	}

	removePressedKey(key: Key) {
		this.pressedKeys.delete(key);
	}

	addKeyToSequence(key: Key) {
		this.keySequence.push(key);
	}

	updateMouse(ev: MouseEvent) {
		this.mouseState = {
			lastMove: { x: ev.movementX, y: ev.movementY },
			position: { x: ev.clientX, y: ev.clientY },
			pagePosition: { x: ev.pageX, y: ev.pageY },
			screenPosition: { x: ev.screenX, y: ev.screenY }
		}
	}


}
