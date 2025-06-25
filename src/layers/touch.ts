import { addWindowEventListener } from "../util";

export type TouchLayerEventType = "touchstart" | "touchend" | "touchmove" | "touchcancel";

export interface TouchLayerEvent {
	type: TouchLayerEventType,
	target: HTMLElement,
}


export class TouchLayer {
	constructor(target: HTMLElement | Window) {
		this.touchStart = this.touchStart.bind(this);
		this.touchEnd = this.touchEnd.bind(this);
		this.touchMove = this.touchMove.bind(this);
		this.touchCancel = this.touchCancel.bind(this);

		if (target instanceof Window) {
			addWindowEventListener("touchstart", this.touchStart)
			addWindowEventListener("touchend", this.touchEnd);
			addWindowEventListener("touchmove", this.touchMove);
			addWindowEventListener("touchcancel", this.touchCancel);
		} else if (target instanceof HTMLElement) {
			target.addEventListener("touchstart", this.touchStart);
			target.addEventListener("touchend", this.touchEnd);
			target.addEventListener("touchmove", this.touchMove);
			target.addEventListener("touchcancel", this.touchCancel);
		}
	}

	touchStart(ev: TouchEvent) {

	}

	touchEnd(ev: TouchEvent) {

	}

	touchMove(ev: TouchEvent) {

	}

	touchCancel(ev: TouchEvent) {

	}
}


