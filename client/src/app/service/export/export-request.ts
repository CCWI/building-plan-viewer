/**
 * Export request.
 */
export interface ExportRequest {

	/**
	 * ID of the CAD file to export.
	 */
	cadFileId: number;

	/**
	 * ID of the room mapping collection to export.
	 */
	mappingId?: number;

	/**
	 * Name of the color map to export with.
	 */
	colorMap?: string;

}
