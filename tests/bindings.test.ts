import { test, expect } from "vitest";
import { createBinding, parseBinding, splitBinding } from "../src/bindings";

test("Test splitting binding", () => {
	const split = splitBinding("KeyD+KeyC>ShiftLeft");

	expect(split).toStrictEqual(["KeyD", "+", "KeyC", ">", "ShiftLeft"]);
});

test("Test parsing single key binding", () => {
	let inputs = parseBinding("KeyD");

	expect(inputs).toStrictEqual([["KeyD"]]);
});

test("Test parsing multi-key binding", () => {
	let inputs = parseBinding("ShiftLeft+KeyD");

	expect(inputs).toStrictEqual([["ShiftLeft", "KeyD"]]);
});

test("Test parsing multi-key binding with spaces", () => {
	let inputs = parseBinding("ShiftLeft + KeyD > KeyC");

	expect(inputs).toStrictEqual([["ShiftLeft", "KeyD"], ["KeyC"]]);
});

test("Test parsing complex multi-group binding", () => {
	const binding = parseBinding("ShiftLeft+KeyD>ShiftLeft+KeyE+KeyC>KeyR");

	expect(binding).toStrictEqual([
		["ShiftLeft", "KeyD"],
		["ShiftLeft", "KeyE", "KeyC"],
		["KeyR"],
	]);
});

test("Test parsing binding with duplicate combinators", () => {
	const binding = parseBinding("ShiftLeft++KeyD+KeyC>>KeyE");

	expect(binding).toStrictEqual([["ShiftLeft", "KeyD", "KeyC"], ["KeyE"]]);
});

test("Test parsing binding beginning with combinators", () => {
	const binding = parseBinding("+ShiftLeft>KeyE");

	expect(binding).toStrictEqual([["ShiftLeft"], ["KeyE"]]);
});

test("Test single binding creation", () => {
	let binding = createBinding("KeyW", () => {});

	expect(binding?.keys).toStrictEqual([["KeyW"]]);
});

test("Test combination binding creation", () => {
	let binding = createBinding("ShiftLeft+KeyW", () => {});

	expect(binding?.keys).toStrictEqual([["ShiftLeft", "KeyW"]]);
});
