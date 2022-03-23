import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {CADFileReference} from "./cad-file-reference";
import {CADFile} from "./cad-file";

/**
 * Service managing CAD files.
 */
@Injectable({
	providedIn: "root"
})
export class CADFileService {

	/**
	 * Path of the CAD REST controller.
	 */
	private static readonly CONTROLLER_PATH: string = "/api/cad";

	constructor(
		private readonly http: HttpClient
	) {
	}

	/**
	 * Create a CAD file.
	 * @param file to create
	 */
	public async create(file: CADFile): Promise<CADFileReference> {
		return await this.http.post<CADFileReference>(`${CADFileService.CONTROLLER_PATH}`, file).toPromise();
	}

	/**
	 * Get references to all available CAD files.
	 */
	public async getAll(): Promise<CADFileReference[]> {
		return await this.http.get<CADFileReference[]>(`${CADFileService.CONTROLLER_PATH}`).toPromise();
	}

	/**
	 * Get a specific CAD file.
	 * @param id of the file to get
	 */
	public async getOne(id: number): Promise<CADFile> {
		return await this.http.get<CADFile>(`${CADFileService.CONTROLLER_PATH}/${id}`).toPromise();
	}

	/**
	 * Update the passed already existing CAD file.
	 * @param file to update
	 */
	public async update(file: CADFile): Promise<CADFileReference> {
		return await this.http.put<CADFileReference>(`${CADFileService.CONTROLLER_PATH}`, file).toPromise();
	}

	/**
	 * Delete a CAD file.
	 * @param id of the file to delete
	 */
	public async delete(id: number): Promise<CADFileReference> {
		return await this.http.delete<CADFileReference>(`${CADFileService.CONTROLLER_PATH}/${id}`).toPromise();
	}

}
