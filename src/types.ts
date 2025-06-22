export interface Vector2 {
	x: number;
	y: number;
}

export const v2Zero = (): Vector2 => {
	return {
		x: 0,
		y: 0,
	};
};
