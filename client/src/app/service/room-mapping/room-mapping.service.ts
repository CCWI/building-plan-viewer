import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {RoomMappingCollection} from "./room-mapping-collection";
import {RoomMappingReference} from "./room-mapping-reference";

/**
 * Service manging room mappings.
 */
@Injectable({
	providedIn: "root"
})
export class RoomMappingService {

	/**
	 * Path of the REST controller.
	 */
	private static readonly CONTROLLER_PATH = "/api/room-mapping";

	constructor(
		private readonly http: HttpClient
	) {
	}

	/**
	 * Create a room mapping collection.
	 * @param mapping to create
	 */
	public async create(mapping: RoomMappingCollection): Promise<RoomMappingReference> {
		return await this.http.post<RoomMappingReference>(`${RoomMappingService.CONTROLLER_PATH}`, mapping).toPromise();
	}

	/**
	 * Get references to all available room mapping collections.
	 */
	public async getAll(): Promise<RoomMappingReference[]> {
		return await this.http.get<RoomMappingReference[]>(`${RoomMappingService.CONTROLLER_PATH}`).toPromise();
	}

	/**
	 * Get all room mapping collections that relate to the passed CAD file ID.
	 * @param id of the CAD file to get mappings for
	 */
	public async getAllForCADFileID(id: number): Promise<RoomMappingReference[]> {
		return await this.http.get<RoomMappingReference[]>(`${RoomMappingService.CONTROLLER_PATH}/for/${id}`).toPromise();
	}

	/**
	 * Get a specific room mapping collection.
	 * @param id of the mapping collection to get
	 */
	public async getOne(id: number): Promise<RoomMappingCollection> {
		return await this.http.get<RoomMappingCollection>(`${RoomMappingService.CONTROLLER_PATH}/${id}`).toPromise();
	}

	/**
	 * Update the passed already existing room mapping collection.
	 * @param mapping to update
	 */
	public async update(mapping: RoomMappingCollection): Promise<RoomMappingReference> {
		return await this.http.put<RoomMappingReference>(`${RoomMappingService.CONTROLLER_PATH}`, mapping).toPromise();
	}

	/**
	 * Delete a room mapping collection.
	 * @param id of the room mapping collection to delete
	 */
	public async delete(id: number): Promise<RoomMappingReference> {
		return await this.http.delete<RoomMappingReference>(`${RoomMappingService.CONTROLLER_PATH}/${id}`).toPromise();
	}

}
