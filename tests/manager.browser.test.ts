import { test, expect } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { InputMan } from "../src/manager";

test("Test basic binding", async () => {
	const inputMan = new InputMan(window);
	let pressed = false;
	const success = inputMan.registerBinding("KeyD", () => {
		pressed = true;
	});

	expect(success).toStrictEqual(true);

	await userEvent.keyboard("d");
	expect(pressed).toStrictEqual(true);
});

test("Test multi-key binding", async () => {
	const inputMan = new InputMan(window);

	let pressed = false;

	const success = inputMan.registerBinding("ShiftLeft+KeyE", () => {
		pressed = true;
	});

	expect(success).toStrictEqual(true);
	await userEvent.keyboard("[ShiftLeft>][KeyE]");

	expect(pressed).toStrictEqual(true);
});

test("Test mouse binding", async () => {
	const inputMan = new InputMan(window);

	let pressed = false;

	const success = inputMan.registerBinding("Mouse1", () => (pressed = true));

	expect(success).toStrictEqual(true);
	await userEvent.click(page.getByRole("document"));

	expect(pressed).toStrictEqual(true);
});

test("Test keyboard input callback", async () => {
	const inputMan = new InputMan(window);

	let keys: string[] = [];

	inputMan.keyboard.registerCallback((c) => {
		keys.push(c.key.code ?? "undefined");
	}, "keydown");

	await userEvent.keyboard("[ShiftLeft][KeyE]");

	expect(keys).toStrictEqual(["ShiftLeft", "KeyE"]);
});

test("Test basic sequential binding", async () => {
	const inputMan = new InputMan(window, {
		sequenceTimer: 2500,
		maxSequenceLength: 5,
	});

	let pressed = false;

	inputMan.registerBinding("ShiftLeft > KeyE > KeyD", () => {
		pressed = true;
	});

	await userEvent.keyboard("[ShiftLeft][KeyE][KeyD]");

	expect(pressed).toStrictEqual(true);
});

// Unfortunately, we don't currently have a way to test mouse movement to my knowledge. Test is left as a reminder.
test("Test mouse movement callbacks", async () => { });
