import { test, expect } from "vitest";
import {
	createBinding,
	parseBindingString,
	splitBindingStringEscaped,
} from "../src/bindings";

test("Test basic splitting binding string escaped", () => {
	let input = "++";

	expect(splitBindingStringEscaped(input)).toStrictEqual(["+"]);
});

test("Test splitting binding string escaped x2", () => {
	let input = "++++";

	expect(splitBindingStringEscaped(input)).toStrictEqual(["+", "+"]);
});

test("Test splitting binding string escaped", () => {
	let input = "D+++C";

	expect(splitBindingStringEscaped(input)).toStrictEqual(["D", "+", "C"]);
});

test("Test parsing single key binding", () => {
	let inputs = parseBindingString("KeyD");

	expect(inputs).toStrictEqual([{ code: "KeyD" }]);
});

test("Test parsing multi-key binding", () => {
	let inputs = parseBindingString("ShiftLeft+KeyD");

	expect(inputs).toStrictEqual([{ code: "ShiftLeft" }, { code: "KeyD" }]);
});

test("Test parsing non-physical binding", () => {
	let inputs = parseBindingString("D+++A+Shift", false);

	expect(inputs).toStrictEqual([
		{ key: "D" },
		{ key: "+" },
		{ key: "A" },
		{ key: "Shift" },
	]);
});

test("Test single binding creation", () => {
	let binding = createBinding("KeyW", () => { });

	expect(binding?.keys).toStrictEqual(["KeyW"]);
});

test("Test combination binding creation", () => {
	let binding = createBinding("ShiftLeft+KeyW", () => { });

	expect(binding?.keys).toStrictEqual(["ShiftLeft", "KeyW"]);
});

test("Test binding string with spaces", () => {
	let binding = parseBindingString("ShiftLeft + KeyW");

	expect(binding).toStrictEqual([{ code: "ShiftLeft" }, { code: "KeyW" }]);
})
