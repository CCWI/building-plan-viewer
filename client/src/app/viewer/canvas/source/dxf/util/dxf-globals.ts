/**
 * Global settings for the Dxf drawing/reading process.
 */
export class DxfGlobals {

	/**
	 * Contrast color.
	 */
	private static contrastColor: number = 0x000000;

	/**
	 * Background color.
	 */
	private static backgroundColor: number = 0xFFFFFF;

	/**
	 * Divisions used to interpolate shapes.
	 */
	private static _divisions: number = 16;

	/**
	 * Get the contrast color.
	 */
	public static getContrastColor(): number {
		return this.contrastColor;
	}

	/**
	 * Set the contrast color.
	 * @param color to set
	 */
	public static setContrastColor(color: number): void {
		this.contrastColor = color;
	}

	/**
	 * Get the background color.
	 */
	public static getBackgroundColor(): number {
		return this.backgroundColor;
	}

	/**
	 * Set the background color.
	 * @param color to set
	 */
	public static setBackgroundColor(color: number): void {
		this.backgroundColor = color;
	}

	/**
	 * Get divisions to use to interpolate shapes.
	 */
	static get divisions(): number {
		return this._divisions;
	}

	/**
	 * Set the divisions to use to interpolate shapes.
	 * @param value to set
	 */
	static set divisions(value: number) {
		this._divisions = value;
	}

}
