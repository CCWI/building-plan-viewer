import {Injectable} from "@angular/core";
import {ExportSettings} from "./export-settings";

/**
 * Settings service for the application.
 */
@Injectable({
	providedIn: "root"
})
export class SettingsService {

	/**
	 * Whether the application is currently in export mode.
	 */
	private readonly _isExportMode: boolean;

	/**
	 * Settings of the exported mode of the application.
	 * Note that these are only non-nul is isExportedMode is true.
	 */
	private readonly _exportSettings: ExportSettings | null;

	constructor() {
		this._isExportMode = window["app_isExportMode"] !== undefined && window["app_isExportMode"] === true;
		if (this._isExportMode) {
			this._exportSettings = window["app_exportSettings"];
		} else {
			this._exportSettings = null;
		}
	}

	/**
	 * Check whether we are currently in export mode.
	 */
	public get isExportMode(): boolean {
		return this._isExportMode;
	}

	/**
	 * Get the settings of the exported mode of the application.
	 * Note that these are only non-null if isExportMode returns true.
	 */
	public get exportSettings(): ExportSettings | null {
		return this._exportSettings;
	}

}
