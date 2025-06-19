import { test, expect } from "vitest";
import { createBinding } from "../src/bindings";

test("Test single binding creation", () => {
	let binding = createBinding("KeyW", () => { })

	expect(binding?.keys).toStrictEqual(["KeyW"])
})

test("Test combination binding creation", () => {
	let binding = createBinding("ShiftLeft+KeyW", () => {

	})

	expect(binding?.keys).toStrictEqual(["ShiftLeft", "KeyW"])
})
