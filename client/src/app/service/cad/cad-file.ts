/**
 * Representation of a server-side CAD file.
 */
export interface CADFile {

	/**
	 * ID of the CAD file.
	 * Is not set if creating a new CAD file (for upload).
	 */
	id?: number;

	/**
	 * Name of the file.
	 */
	name: string;

	/**
	 * Type of the file (for example DXF).
	 */
	type: string;

	/**
	 * Charset to interpret the data field with.
	 * May not be set when the data field is not to be interpreted
	 * as text.
	 */
	charsetName?: string;

	/**
	 * Base64 encoded string holding the file data.
	 */
	data: string;

	/**
	 * Timestamp of when the file was uploaded/created.
	 */
	createdTimestamp?: string;

}
