import { test, expect } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { KeyboardLayer, type KeyboardCallbackFn, type KeyboardLayerEvent } from "../../src/layers/keyboard";


test("Test basic keyboard callback", async () => {
	const layer = new KeyboardLayer(window);

	let event: KeyboardLayerEvent | undefined;
	layer.registerCallback((ev) => {
		event = ev;
	})

	await userEvent.keyboard("[ShiftLeft]");

	expect(event).toBeDefined()
	expect(event).toEqual({ key: { code: "ShiftLeft", key: "Shift" }, modifiers: { shift: true, alt: false, ctrl: false, meta: false } })
})

test("Test keyboard is held", async () => {
	const layer = new KeyboardLayer(window);


})

test("Test removing keyboard callback", async () => {
	const layer = new KeyboardLayer(window);

	let event: KeyboardLayerEvent | undefined;
	let event2: KeyboardLayerEvent | undefined;

	const cb: KeyboardCallbackFn = (ev: KeyboardLayerEvent) => {
		event = ev;
	}

	const cb2: KeyboardCallbackFn = (ev: KeyboardLayerEvent) => {
		event2 = ev;
	}

	layer.registerCallback(cb);
	layer.registerCallback(cb2);
	layer.removeCallback(cb);

	await userEvent.keyboard("[ShiftLeft]");

	expect(event).toBeUndefined()
	expect(event2).toBeDefined()
})
