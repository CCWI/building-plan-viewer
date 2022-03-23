/**
 * 3D boundaries.
 */
export interface Bounds3D {

	/**
	 * X-axis dimension range.
	 */
	x: DimensionRange;

	/**
	 * Y-axis dimension range.
	 */
	y: DimensionRange;

	/**
	 * Z-axis dimension range.
	 */
	z: DimensionRange;

}

/**
 * 2D boundaries.
 */
export interface Bounds2D {

	/**
	 * Left offset.
	 */
	left: number;

	/**
	 * Top offset.
	 */
	top: number;

	/**
	 * Width of the bounds.
	 */
	width: number;

	/**
	 * Height of the bounds.
	 */
	height: number;

}

/**
 * Bounds utility methods.
 */
export class BoundsUtil {

	/**
	 * Convert the passed 3-dimensional bounds to 2-dimensional bounds.
	 * @param bounds to convert
	 */
	public static to2DBounds(bounds: Bounds3D): Bounds2D {
		return {
			left: bounds.x.min,
			top: bounds.y.min,
			width: bounds.x.max - bounds.x.min,
			height: bounds.y.max - bounds.y.min
		};
	}

}

/**
 * Range of a dimension.
 */
export interface DimensionRange {

	/**
	 * Minimum of the range.
	 */
	min: number;

	/**
	 * Maximum of the range.
	 */
	max: number;

}
