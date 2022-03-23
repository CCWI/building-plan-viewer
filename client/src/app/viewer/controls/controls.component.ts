import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {Observable, Subject, Subscription} from "rxjs";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {ThemeService} from "../../util/theme/theme.service";
import {SettingsService} from "../../service/settings/settings.service";
import {ColorSelectService} from "../../service/colorSelect/colorSelect.service";
import { environment } from "../../../environments/environment";


/**
 * Component displaying the viewer controls (load file, export, ...).
 */
@Component({
	selector: "app-viewer-controls",
	templateUrl: "controls.component.html",
	styleUrls: ["controls.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlsComponent implements OnInit, OnDestroy {

	/**
	 * Subject emitting events when the load button has been clicked.
	 */
	private readonly _onUploadSubject: Subject<void> = new Subject<void>();

	/**
	 * Subject emitting events when the open button has been clicked.
	 */
	private readonly _onOpenSubject: Subject<void> = new Subject<void>();

	/**
	 * Subject emitting events when the export button has been clicked.
	 */
	private readonly _onExportSubject: Subject<void> = new Subject<void>();

	/**
	 * Subject emitting events when the export button has been clicked.
	 */
	private readonly _onColorPickerSubject: Subject<void> = new Subject<void>();

	/**
	 * Subject emitting events when the viewport reset button has been clicked.
	 */
	private readonly _onViewportResetSubject: Subject<void> = new Subject<void>();

	/**
	 * Subject emitting events when the button to manage room mappings has been clicked.
	 */
	private readonly _onManageRoomMappingsSubject: Subject<void> = new Subject<void>();

	/**
	 * Subject emitting events when the toggle to hide Labels has been clicked.
	 */
	private readonly _onHideLabelsSubject: Subject<void> = new Subject<void>();

	/**
	 * Subject emitting events when the Button to change the background color has been clicked.
	 */
	private readonly _onBackgroundColorSubject: Subject<void> = new Subject<void>();

	/**
	 * Subscription to theme changes.
	 */
	private themeChangeSub: Subscription;

	/**
	 * Whether dark mode is currently activated.
	 */
	public isDarkMode = false;

	/**
	 * Whether dark mode is currently activated.
	 */
	public labelsHidden = false;

	/**
	 * Initially selected Color of Color Picker Tool.
	 */
	public color = "#333333";

	/**
	 * Whether canvas specific options are currently enabled.
	 */
	private _canvasOptionsEnabled = false;

	/**
	 * Whether the application is currently running in export mode.
	 */
	public readonly isExportMode: boolean;

	/**
	 * Get Link to Viewer IP.
	 */
	public readonly viewerIP = environment.viewerIP;


	constructor(
		private readonly themeService: ThemeService,
		private readonly cd: ChangeDetectorRef,
		private readonly settingsService: SettingsService,
		private colorSelectService: ColorSelectService
	) {
		this.isExportMode = this.settingsService.isExportMode;
	}

	/**
	 * Called on component destruction.
	 */
	public ngOnDestroy(): void {
		this._onUploadSubject.complete();
		this._onOpenSubject.complete();
		this._onExportSubject.complete();
		this._onViewportResetSubject.complete();
		this._onColorPickerSubject.complete();
		this._onManageRoomMappingsSubject.complete();
		this._onHideLabelsSubject.complete();
		this._onBackgroundColorSubject.complete();

		this.themeChangeSub.unsubscribe();
	}

	/**
	 * Called on component initialization.
	 */
	public ngOnInit(): void {
		this.isDarkMode = this.themeService.darkMode;
		this.themeChangeSub = this.themeService.changes.subscribe((darkMode) => {
			this.isDarkMode = darkMode;
		});
	}

	/**
	 * Called when the open button has been clicked.
	 */
	public onOpenClicked(): void {
		this._onOpenSubject.next();
	}

	/**
	 * Called when the upload button has been clicked.
	 */
	public onUploadClicked(): void {
		this._onUploadSubject.next();
	}

	/**
	 * Called when the export button has been clicked.
	 */
	public onExportClicked(): void {
		this._onExportSubject.next();
	}

	/**
	 * Called when the Background Color button has been clicked.
	 */
	public onBackgroundColorClicked(): void {
		this._onBackgroundColorSubject.next();
	}

	/**
	 * Called when the viewport reset button has been clicked.
	 */
	public onViewportResetClicked(): void {
		this._onViewportResetSubject.next();
	}

	/**
	 * Called when the Color Picker button has been clicked.
	 */
	public onColorPickerClicked(): void {
		this.colorSelectService.setCatColor(this.color);
		this._onColorPickerSubject.next();
	}

	/**
	 * Called when the room mappings manage button has been clicked.
	 */
	public onRoomMappingsClicked(): void {
		this._onManageRoomMappingsSubject.next();
	}

	/**
	 * Called when the hide Labels manage button has been clicked.
	 */
	public onHideLabelsToggled(event: MatSlideToggleChange) {
		this._onHideLabelsSubject.next();
	}

	/**
	 * Called on theme change.
	 * @param event which occurred
	 */
	public onThemeChange(event: MatSlideToggleChange) {
		this.themeService.darkMode = !this.themeService.darkMode;
	}

	/**
	 * Get an observable of events when the open button has been clicked.
	 */
	get onOpen(): Observable<void> {
		return this._onOpenSubject.asObservable();
	}

	/**
	 * Get an observable of events when the upload button has been clicked.
	 */
	get onUpload(): Observable<void> {
		return this._onUploadSubject.asObservable();
	}

	/**
	 * Get an observable of events when the export button has been clicked.
	 */
	get onExport(): Observable<void> {
		return this._onExportSubject.asObservable();
	}

	/**
	 * Get an observable of events when the viewport reset button has been clicked.
	 */
	get onViewportReset(): Observable<void> {
		return this._onViewportResetSubject.asObservable();
	}

	/**
	 * Get an observable of events when the color change button has been clicked.
	 */
	get onColorPickerChange(): Observable<void> {
		return this._onColorPickerSubject.asObservable();
	}

	/**
	 * Get an observable of events when the button to manage room mappings has been clicked.
	 */
	get onManageRoomMappings(): Observable<void> {
		return this._onManageRoomMappingsSubject.asObservable();
	}

	/**
	 * Get an observable of events when the button to hide Labels has been clicked.
	 */
	get onHideLabels(): Observable<void> {
		return this._onHideLabelsSubject.asObservable();
	}

	/**
	 * Get an observable of events when the button to Change the Background Color has been clicked.
	 */
	get onBackgroundColorChange(): Observable<void> {
		return this._onBackgroundColorSubject.asObservable();
	}

	/**
	 * Enable or disable canvas specific options.
	 * @param value to set
	 */
	public set canvasOptionsEnabled(value: boolean) {
		this._canvasOptionsEnabled = value;
		this.cd.markForCheck();
	}

	/**
	 * Check whether canvas specific options are currently enabled.
	 */
	public get canvasOptionsEnabled(): boolean {
		return this._canvasOptionsEnabled;
	}

	/**
	 * Returns opacity for the color picker icon.
	 */
	public getOpacity(): string {
		if (this.canvasOptionsEnabled === false){
			return "0.2";
		}
		else {
			return "0.87";
		}
	}

	public refresh(): void {
		window.location.href = this.viewerIP;
	}
}
