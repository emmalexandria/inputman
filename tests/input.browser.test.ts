import { test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context"
import { InputMan } from "../src/input";

test("Test basic binding", async () => {
	const inputMan = new InputMan()
	let pressed = false
	const success = inputMan.registerBindingString("KeyD", () => {
		pressed = true
	})

	expect(success).toStrictEqual(true);

	await userEvent.keyboard("d")
	expect(pressed).toStrictEqual(true)
})

test("Test multi-key binding", async () => {
	const inputMan = new InputMan();

	let pressed = false;

	const success = inputMan.registerBindingString("ShiftLeft+KeyE", () => {
		pressed = true;
	})

	expect(success).toStrictEqual(true);
	await userEvent.keyboard("[ShiftLeft>][KeyE]")

	expect(pressed).toStrictEqual(true)
})
