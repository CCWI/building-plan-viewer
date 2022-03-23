/**
 * Collection of room mappings.
 */
import {RoomMapping} from "./room-mapping";

export interface RoomMappingCollection {

	/**
	 * ID of the collection.
	 */
	id?: number;

	/**
	 * Name of the collection.
	 */
	name: string;

	/**
	 * ID of the CAD file this mapping relates to.
	 */
	cadFileID: number;

	/**
	 * Timestamp of when the mapping was created.
	 */
	createdTimestamp?: string;

	/**
	 * Room mappings in this collection.
	 */
	mappings: RoomMapping[];

}
