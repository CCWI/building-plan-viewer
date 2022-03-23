import {Base64} from "js-base64";

/**
 * Utility class for working with binary strings.
 */
export class BinaryUtil {

	/**
	 * Convert the passed byte array to a base 64 string.
	 * @param arr to convert
	 */
	public static encodeBase64(arr: Uint8Array): string {
		return Base64.fromUint8Array(arr);
	}

	/**
	 * Decode the passed base64 encoded string.
	 * @param str to decode
	 */
	public static decodeBase64(str: string): Uint8Array {
		return Base64.toUint8Array(str);
	}

}
