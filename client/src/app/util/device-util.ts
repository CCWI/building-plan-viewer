/**
 * Utility methods regarding the current device.
 */
export class DeviceUtil {

	/**
	 * Check if the current device supports touch events.
	 */
	public static isTouchSupported(): boolean {
		return matchMedia("(hover: none), (pointer: coarse)").matches;
	}

}
