export interface Key {
	/// The character of the key, including modifiers like shift
	key?: string;
	/// The physical location of the key (based on U.S. QWERTY layout)
	code?: string;
}


export enum MouseInputs {
	One,
	Two,
	Three,
	Four,
	Five,
	ScrollDown,
	ScrollUp,
}

export type Input = MouseInputs | Key

export function getMouseButtonName(button: number): string {
	switch (button) {
		case 0: return "Mouse1"
		case 1: return "Mouse3"
		case 2: return "Mouse2"
		case 3: return "Mouse4"
		case 4: return "Mouse5"
	}

	return "MouseInvalid"
}
