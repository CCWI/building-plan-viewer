import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ExportRequest} from "./export-request";

/**
 * Service used to export the currently viewed CAD file and mapping.
 */
@Injectable({
	providedIn: "root"
})
export class ExportService {

	/**
	 * Path of the export REST controller.
	 */
	private static readonly CONTROLLER_PATH: string = "/api/export";

	constructor(
		private readonly http: HttpClient
	) {
	}

	/**
	 * Export using the passed options as HTML file.
	 * @param options to apply for the export
	 */
	public async exportAsHTML(options: ExportRequest): Promise<string> {
		return await this.http.post(`${ExportService.CONTROLLER_PATH}/html`, options, {responseType: "text"}).toPromise();
	}

}
