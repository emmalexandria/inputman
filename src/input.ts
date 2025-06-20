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


