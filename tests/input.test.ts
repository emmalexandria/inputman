import { test, expect } from "vitest";
import { Inputs } from "../src/input";
import { KeyInput } from "../src/layers/keyboard";

test("Test basic inputs to binding descriptor", () => {
	const inputs = new Inputs();

	inputs.press(new KeyInput({ code: "KeyD" }));

	const b = inputs.toBindingDescriptor()

	expect(b).toStrictEqual([["KeyD"]])
})

test("Test inputs to binding descriptor with sequential presses", () => {
	const inputs = new Inputs();

	inputs.press(new KeyInput({ code: "KeyD" }));
	inputs.unpress(new KeyInput({ code: "KeyD" }));

	inputs.press(new KeyInput({ code: "KeyE" }));

	const b = inputs.toBindingDescriptor();

	expect(b).toStrictEqual([["KeyD"], ["KeyE"]])
});

test("Test inputs to binding descriptor with multi-key groups", () => {
	const inputs = new Inputs();

	inputs.press(new KeyInput({ code: "KeyE" }));
	inputs.press(new KeyInput({ code: "KeyD" }));

	inputs.unpress(new KeyInput({ code: "KeyD" }));
	inputs.press(new KeyInput({ code: "ShiftLeft" }));

	const b = inputs.toBindingDescriptor();

	expect(b).toStrictEqual([["KeyE", "KeyD"], ["KeyE", "ShiftLeft"]])
})
