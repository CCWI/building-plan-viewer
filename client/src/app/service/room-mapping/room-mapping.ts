import {Vertex} from "./vertex";

/**
 * Mapping for rooms.
 */
export interface RoomMapping {

	/**
	 * Name of the room.
	 */
	roomName: string;

	/**
	 * The rooms category.
	 */
	category: number;

	/**
	 * Description of the room to map to.
	 */
	description?: string;

	/**
	 * Vertex to try to map a specific shape to in the CAD file.
	 */
	mappingVertex?: Vertex;

	/**
	 * List of vertices describing the room.
	 */
	vertices?: Vertex[];

}
