/**
 * Reference to a server-side CAD file.
 */
export interface CADFileReference {

	/**
	 * ID of the CAD file.
	 */
	id: number;

	/**
	 * Name of the CAD file.
	 */
	name: string;

	/**
	 * Timestamp of when the file was created.
	 */
	createdTimestamp: string;

}
