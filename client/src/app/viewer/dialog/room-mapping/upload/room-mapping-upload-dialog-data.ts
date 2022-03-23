/**
 * Input data for the room mapping upload dialog.
 */
export interface RoomMappingUploadDialogData {

	/**
	 * ID of the CAD file to map to.
	 */
	cadFileID: number;

	/**
	 * Initial file to preselect.
	 */
	file?: File;

}
