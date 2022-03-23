import {Injectable} from "@angular/core";

/**
 * Service providing local application settings.
 */
@Injectable({
	providedIn: "root"
})
export class LocalSettingsService {

	/**
	 * Prefix for local app settings.
	 */
	private static readonly PREFIX = "settings";

	/**
	 * Key for the dark mode setting.
	 */
	private static readonly DARK_MODE = `${LocalSettingsService.PREFIX}.dark-mode`;

	/**
	 * Check whether dark mode is enabled.
	 */
	public isDarkMode(): boolean {
		return (localStorage.getItem(LocalSettingsService.DARK_MODE) ?? "false") === "true";
	}

	/**
	 * Set the dark mode setting.
	 * @param value of the dark mode setting
	 */
	public setDarkMode(value: boolean): void {
		localStorage.setItem(LocalSettingsService.DARK_MODE, String(value));
	}

}
