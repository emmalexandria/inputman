import type { InputMan } from "../manager";
import { v2Zero, type Vector2 } from "../types"
import { addWindowEventListener } from "../util"

interface MouseState {
	position: Vector2,
	pagePosition: Vector2,
	screenPosition: Vector2
	lastMove: Vector2
}

export type MouseCallbackFn = (ev: MouseEvent | Event, state: MouseState) => void;
export type MouseCallbackType = "mousedown" | "mouseup" | "mousemove" | "scroll";

interface MouseCallback {
	type: MouseCallbackType,
	fn: MouseCallbackFn
}

export class MouseLayer {
	state: MouseState;
	manager: InputMan;
	private callbacks: Array<MouseCallback> = new Array();


	constructor(manager: InputMan, target: Window | HTMLElement) {
		this.manager = manager;
		this.state = {
			position: v2Zero(),
			pagePosition: v2Zero(),
			screenPosition: v2Zero(),
			lastMove: v2Zero()
		}

		this.mouseDown = this.mouseDown.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseScroll = this.mouseScroll.bind(this);

		if (target instanceof Window) {
			addWindowEventListener("mousedown", this.mouseDown);
			addWindowEventListener("mouseup", this.mouseUp);
			addWindowEventListener("mousemove", this.mouseMove);
			addWindowEventListener("scroll", this.mouseScroll);
		} else if (target instanceof HTMLElement) {
			target.addEventListener("mousedown", this.mouseDown);
			target.addEventListener("mouseup", this.mouseUp);
			target.addEventListener("mousemove", this.mouseMove);
			target.addEventListener("scroll", this.mouseScroll);
		}
	}

	registerCallback(cb: MouseCallbackFn, type: MouseCallbackType) {
		this.callbacks.push({ fn: cb, type })
	}

	private invokeCallbacks(ev: MouseEvent | Event, type: MouseCallbackType) {
		const filtered = this.callbacks.filter((cb) => cb.type === type);
		filtered.forEach((cb) => cb.fn(ev, this.state));
	}

	mouseDown(ev: MouseEvent) {
		this.invokeCallbacks(ev, "mousedown");
		this.manager.pressInput(getMouseButtonName(ev.button));
	}

	mouseUp(ev: MouseEvent) {
		this.invokeCallbacks(ev, "mouseup");
		this.manager.releaseInput(getMouseButtonName(ev.button));
	}

	mouseMove(ev: MouseEvent) {
		this.state = {
			lastMove: { x: ev.movementX, y: ev.movementY },
			position: { x: ev.clientX, y: ev.clientY },
			screenPosition: { x: ev.screenX, y: ev.screenY },
			pagePosition: { x: ev.pageX, y: ev.pageY }
		}
		this.invokeCallbacks(ev, "mousemove")
	}

	mouseScroll(ev: Event) {
		this.invokeCallbacks(ev, "scroll");
	}
}

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





