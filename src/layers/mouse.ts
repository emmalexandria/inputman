import type { Modifiers } from "../input";
import type { InputMan } from "../manager";
import { v2Zero, type Vector2 } from "../types";
import { addWindowEventListener } from "../util";

interface MouseState {
	position: Vector2;
	pagePosition: Vector2;
	screenPosition: Vector2;
	lastMove: Vector2;
}

export type MouseCallbackFn = (
	ev: MouseLayerEvent,
	state: MouseState,
) => void;

export interface MouseLayerEvent {
	ev: MouseEvent | Event;
	button?: string;
	modifiers?: Modifiers
}

export type MouseCallbackType =
	| "mousedown"
	| "mouseup"
	| "mousemove"
	| "scroll";

interface MouseCallback {
	type: MouseCallbackType;
	fn: MouseCallbackFn;
}

export class MouseLayer {
	state: MouseState;
	manager: InputMan;
	private callbacks: Array<MouseCallback> = [];
	private target: Window | HTMLElement;

	constructor(manager: InputMan, target: Window | HTMLElement) {
		this.manager = manager;
		this.target = target;

		this.state = {
			position: v2Zero(),
			pagePosition: v2Zero(),
			screenPosition: v2Zero(),
			lastMove: v2Zero(),
		};

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
		this.callbacks.push({ fn: cb, type });
	}

	private invokeCallbacks(ev: MouseEvent | Event, type: MouseCallbackType) {
		// We have two event types here, scroll (Event) and mouse button moves/clicks (MouseEvent)
		// So we start by just filling out the event
		let event: MouseLayerEvent = {
			ev
		};
		// And if its a MouseEvent we fill in all the additional details we have from that
		if (ev instanceof MouseEvent) {
			event.modifiers = {
				shift: ev.shiftKey,
				alt: ev.altKey,
				ctrl: ev.ctrlKey,
				meta: ev.metaKey
			}
			// Before we set the button, we check its a mouse button event and not a mouse move event
			if (type === "mousedown" || type === "mouseup") {
				event.button = getMouseButtonName(ev.button)
			}
		}
		// Then we filter the callbacks for those which match the type of event we have
		const filtered = this.callbacks.filter((cb) => cb.type === type);
		// And finally we can send the event object to each callback, also passing in the MouseState which contains
		// all the juicy details about mouse position and movement.
		filtered.forEach((cb) => cb.fn(event, this.state));
	}

	private mouseDown(ev: MouseEvent) {
		this.invokeCallbacks(ev, "mousedown");
		this.manager.pressInput(getMouseButtonName(ev.button));
	}

	private mouseUp(ev: MouseEvent) {
		this.invokeCallbacks(ev, "mouseup");
		this.manager.releaseInput(getMouseButtonName(ev.button));
	}

	private mouseMove(ev: MouseEvent) {
		this.state = {
			lastMove: { x: ev.movementX, y: ev.movementY },
			position: { x: ev.clientX, y: ev.clientY },
			screenPosition: { x: ev.screenX, y: ev.screenY },
			pagePosition: { x: ev.pageX, y: ev.pageY },
		};
		this.invokeCallbacks(ev, "mousemove");
	}

	mouseScroll(ev: Event) {
		this.invokeCallbacks(ev, "scroll");
	}

	lockCursor() {
		if (this.target instanceof Window) {
			window.document.documentElement.requestPointerLock();
		} else {
			this.target.requestPointerLock();
		}
	}

	unlockCursor() {
		window.document.exitPointerLock();
	}
}

export function getMouseButtonName(button: number): string {
	switch (button) {
		case 0:
			return "Mouse1";
		case 1:
			return "Mouse3";
		case 2:
			return "Mouse2";
		case 3:
			return "Mouse4";
		case 4:
			return "Mouse5";
	}

	return "MouseInvalid";
}
