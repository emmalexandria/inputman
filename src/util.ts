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

	return false
}

export function arraysEqual<T>(array1: T[], array2: T[]): boolean {
	return array1.length === array2.length && array1.every((e) => {
		return array2.includes(e)
	})
}
