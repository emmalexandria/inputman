import { test, expect } from "vitest";
import { page, userEvent } from "@vitest/browser/context"
import { InputMan } from "../src/manager";

test("Test basic binding", async () => {
	const inputMan = new InputMan(window)
	let pressed = false
	const success = inputMan.registerBinding("KeyD", () => {
		pressed = true
	})

	expect(success).toStrictEqual(true);

	await userEvent.keyboard("d")
	expect(pressed).toStrictEqual(true)
})

test("Test multi-key binding", async () => {
	const inputMan = new InputMan(window);

	let pressed = false;

	const success = inputMan.registerBinding("ShiftLeft+KeyE", () => {
		pressed = true;
	})

	expect(success).toStrictEqual(true);
	await userEvent.keyboard("[ShiftLeft>][KeyE]")

	expect(pressed).toStrictEqual(true)
})

test("Test mouse binding", async () => {
	const inputMan = new InputMan(window);

	let pressed = false;

	const success = inputMan.registerBinding("Mouse1+KeyE", () => pressed = true)

	expect(success).toStrictEqual(true);
	await Promise.all([userEvent.click(page.getByRole('document')), userEvent.keyboard('[KeyE]')])

	expect(pressed).toStrictEqual(true)
})

test("Test keyboard input callback", async () => {
	const inputMan = new InputMan(window);

	let keys: string[] = []

	inputMan.registerButtonCallback((c) => {
		keys.push(c.button?.code ?? "undefined")
	})

	await userEvent.keyboard("[ShiftLeft][KeyE]")

	expect(keys).toStrictEqual(["ShiftLeft", "KeyE"])
})


// Unfortunately, we don't currently have a way to test mouse movement to my knowledge. Test is left as a reminder.
test("Test mouse movement callbacks", async () => {

})
