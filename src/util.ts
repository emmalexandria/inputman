export function arrayContainsOrd<T>(outer: T[], inner: T[]): boolean {
	if (inner.length === 0) return true;
	if (inner.length > outer.length) return false;

	const maxIdx = outer.length - (inner.length - 1);
	const sliceLen = inner.length;

	for (let i = 0; i < maxIdx; i++) {
		if (arraysEqual(outer.slice(i, i + sliceLen), inner)) {
			return true;
		}
	}

	return false;
}

export function arrayEqual2d<T>(a: T[][], b: T[][]): boolean {
	if (a.length !== b.length) return false;

	for (let i = 0; i < a.length; i++) {
		// We know rowA is defined, so !
		const rowA = a[i]!;
		const rowB = b[i];

		// If rowB is not defined, we already know the arrays are not equal
		if (!rowB) return false;
		// And if they have different lengths, they are also not equal
		if (rowA.length !== rowB.length) return false;

		for (let j = 0; j < rowA.length; j++) {
			if (rowA[j] !== rowB[j]) return false;
		}
	}

	return true
}

export function arraysEqual<T>(array1: T[], array2: T[]): boolean {
	return (
		array1.length === array2.length &&
		array1.every((e) => {
			return array2.includes(e);
		})
	);
}

// Nasty little hack required because addEventListener on window doesn't infer the correct event type
export function addWindowEventListener<K extends keyof WindowEventMap>(
	type: K,
	listener: (this: Window, ev: WindowEventMap[K]) => void,
) {
	window.addEventListener(type, listener);
}

export function cullSequence<T>(input: T[], maxLength: number): T[] {
	if (input.length > maxLength) {
		const len = input.length;
		const start = len - maxLength;
		input = input.slice(start, len);
	}

	return input;
}
