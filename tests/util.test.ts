import { test, expect } from "vitest";
import { arrayContainsOrd } from "../src/util";

test("Test array contains ordered", () => {
	expect(arrayContainsOrd([1, 2, 3, 4, 5], [1, 2, 3])).toStrictEqual(true);
	expect(arrayContainsOrd([1, 4, 2, 8, 10, 15], [8, 10, 15])).toStrictEqual(
		true,
	);
	expect(arrayContainsOrd([1, 4, 2, 8, 10, 15], [4, 15, 1])).toStrictEqual(
		false,
	);
});
