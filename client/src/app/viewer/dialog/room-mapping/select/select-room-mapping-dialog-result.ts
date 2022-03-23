import {RoomMappingReference} from "../../../../service/room-mapping/room-mapping-reference";

/**
 * Result of the room mapping dialog.
 */
export interface SelectRoomMappingDialogResult {

	/**
	 * Name of the colormap to use.
	 */
	colormap: string;

	/**
	 * Reference to show.
	 * May be null when there should be no mapping shown.
	 */
	reference?: RoomMappingReference;

}
