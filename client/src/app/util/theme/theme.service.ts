import {Injectable, OnDestroy} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {LocalSettingsService} from "../settings/local-settings.service";

/**
 * Service used to toggle between themes.
 */
@Injectable({
	providedIn: "root",
})
export class ThemeService implements OnDestroy {

	/**
	 * Subject emitting theme events once it changes.
	 */
	private subject: Subject<boolean> = new Subject<boolean>();

	/**
	 * Whether dark mode is currently enabled.
	 */
	private _darkMode = false;

	constructor(
		private readonly localSettingsService: LocalSettingsService
	) {
		this._darkMode = this.localSettingsService.isDarkMode();
	}

	/**
	 * Called when the service is destroyed.
	 */
	ngOnDestroy(): void {
		this.subject.complete();
	}

	/**
	 * Check whether dark mode is currently enabled.
	 */
	get darkMode(): boolean {
		return this._darkMode;
	}

	/**
	 * Activate or deactivate the dark mode.
	 * @param value whether to activate dark mode
	 */
	set darkMode(value: boolean) {
		this._darkMode = value;
		this.localSettingsService.setDarkMode(value);
		this.subject.next(value);
	}

	/**
	 * Get an observable of changes to the current theme.
	 */
	get changes(): Observable<boolean> {
		return this.subject.asObservable();
	}

}
