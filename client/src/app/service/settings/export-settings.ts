import {CADFile} from "../cad/cad-file";
import {RoomMappingCollection} from "../room-mapping/room-mapping-collection";

/**
 * Settings of the exported mode.
 */
export interface ExportSettings {

	/**
	 * CAD file to display.
	 */
	cadFile: CADFile;

	/**
	 * Room mapping collection to display.
	 */
	roomMappingCollection?: RoomMappingCollection;

	/**
	 * Name of the color map to use.
	 */
	colorMap?: string;

}
