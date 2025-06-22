import { test, expect } from "vitest";
import {
	createBinding,
	parseBindingString,
	splitBinding,
	splitBindingStringEscaped,
} from "../src/bindings";

test("Test splitting binding", () => {
	const split = splitBinding("KeyD+KeyC>ShiftLeft");

	expect(split).toStrictEqual(["KeyD", "+", "KeyC", ">", "ShiftLeft"]);
})

test("Test parsing single key binding", () => {
	let inputs = parseBindingString("KeyD");

	expect(inputs).toStrictEqual([["KeyD"]]);
});

test("Test parsing multi-key binding", () => {
	let inputs = parseBindingString("ShiftLeft+KeyD");

	expect(inputs).toStrictEqual([["ShiftLeft", "KeyD"]]);
});

test("Test parsing complex multi-group binding", () => {
	const binding = parseBindingString("ShiftLeft+KeyD>ShiftLeft+KeyE+KeyC>KeyR");

	expect(binding).toStrictEqual([["ShiftLeft", "KeyD"], ["ShiftLeft", "KeyE", "KeyC"], ["KeyR"]])
})

test("Test single binding creation", () => {
	let binding = createBinding("KeyW", () => { });

	expect(binding?.keys).toStrictEqual([["KeyW"]]);
});


test("Test combination binding creation", () => {
	let binding = createBinding("ShiftLeft+KeyW", () => { });

	expect(binding?.keys).toStrictEqual([["ShiftLeft", "KeyW"]]);
});


