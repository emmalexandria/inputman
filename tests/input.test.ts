import { test, expect } from "vitest";
import { Inputs } from "../src/input";
import { KeyInput } from "../src/layers/keyboard";

test("Test basic inputs to binding descriptor", () => {
	const inputs = new Inputs();

	inputs.press(new KeyInput({ code: "KeyD" }));

	const b = inputs.toBindingDescriptor(1);

	expect(b).toStrictEqual([["KeyD"]]);
});

test("Test inputs to binding descriptor with sequential presses", () => {
	const inputs = new Inputs();

	inputs.press(new KeyInput({ code: "KeyD" }));
	inputs.unpress(new KeyInput({ code: "KeyD" }));

	inputs.press(new KeyInput({ code: "KeyE" }));

	const b = inputs.toBindingDescriptor(2);

	expect(b).toStrictEqual([["KeyD"], ["KeyE"]]);
});

test("Test inputs to binding descriptor with multi-key groups", () => {
	const inputs = new Inputs();

	inputs.press(new KeyInput({ code: "KeyE" }));
	inputs.press(new KeyInput({ code: "KeyD" }));

	inputs.unpress(new KeyInput({ code: "KeyD" }));
	inputs.press(new KeyInput({ code: "ShiftLeft" }));

	const b = inputs.toBindingDescriptor(2);

	expect(b).toStrictEqual([
		["KeyE", "KeyD"],
		["KeyE", "ShiftLeft"],
	]);
});

test("Test correct handling of key releases in binding descriptor conversion", () => {
	const inputs = new Inputs();

	inputs.press(new KeyInput({ code: "ShiftLeft" }));
	inputs.press(new KeyInput({ code: "Space" }));

	inputs.unpress(new KeyInput({ code: "Space" }));
	inputs.press(new KeyInput({ code: "KeyC" }));

	const b = inputs.toBindingDescriptor(2);

	expect(b).toStrictEqual([
		["ShiftLeft", "Space"],
		["ShiftLeft", "KeyC"],
	]);
});

test("Test inputs to complex binding descriptor", () => {
	const inputs = new Inputs();

	inputs.press(new KeyInput({ code: "KeyD" }));
	inputs.press(new KeyInput({ code: "KeyB" }));
	inputs.unpress(new KeyInput({ code: "KeyD" }));
	inputs.unpress(new KeyInput({ code: "KeyB" }));
	inputs.press(new KeyInput({ code: "KeyC" }));
	inputs.unpress(new KeyInput({ code: "KeyC" }));

	inputs.press(new KeyInput({ code: "ShiftLeft" }));
	inputs.press(new KeyInput({ code: "Space" }));
	inputs.press(new KeyInput({ code: "KeyR" }));

	const b = inputs.toBindingDescriptor(3);

	expect(b).toStrictEqual([
		["KeyD", "KeyB"],
		["KeyC"],
		["ShiftLeft", "Space", "KeyR"],
	]);
});
