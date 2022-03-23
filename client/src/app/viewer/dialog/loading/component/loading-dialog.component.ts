import {AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy} from "@angular/core";
import {LoadingDialogConfig} from "../config/loading-dialog-config";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Observable, Subject} from "rxjs";
import {first} from "rxjs/operators";

/**
 * Loading dialog component.
 */
@Component({
	selector: "app-loading-dialog-component",
	templateUrl: "loading-dialog.component.html",
	styleUrls: ["loading-dialog.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingDialogComponent implements OnDestroy, AfterViewChecked {

	/**
	 * Subject where cancel events are published over.
	 */
	private readonly cancelSubject: Subject<void> = new Subject<void>();

	/**
	 * Subject where events are published when ever the dialogs view has been checked.
	 */
	private readonly viewCheckedSubject: Subject<void> = new Subject<void>();

	/**
	 * Whether cancel was requested.
	 */
	private cancelRequested: boolean = false;

	constructor(
		private readonly cd: ChangeDetectorRef,
		@Inject(MAT_DIALOG_DATA) private config: LoadingDialogConfig
	) {
	}

	/**
	 * Update the dialog configuration.
	 */
	public update(config: LoadingDialogConfig): void {
		this.config = config;
		this.cd.detectChanges();
	}

	/**
	 * Check whether the progress indicator should be determinate.
	 */
	public get isDeterminate(): boolean {
		return this.config.progress !== null && this.config.progress !== undefined;
	}

	/**
	 * Get the progress in range 0 to 100.
	 */
	public get progress(): number {
		return Math.round(this.config.progress);
	}

	/**
	 * Get the message to display.
	 */
	public get message(): string {
		return this.config.message;
	}

	/**
	 * Check whether cancelling the dialog is allowed.
	 */
	public get isCancelAllowed(): boolean {
		return !!this.config.cancelAllowed;
	}

	/**
	 * Get cancel events.
	 */
	public cancelEvents(): Observable<void> {
		return this.cancelSubject.asObservable();
	}

	/**
	 * Get the next view check event.
	 */
	public onNextViewChecked(): Observable<void> {
		return this.viewCheckedSubject.asObservable().pipe(first());
	}

	/**
	 * Called when the cancel button has been clicked.
	 */
	public onCancel(): void {
		if (!this.cancelRequested) {
			this.cancelRequested = true;

			this.cancelSubject.next();
		}
	}

	/**
	 * Called on component destruction.
	 */
	public ngOnDestroy(): void {
		this.cancelSubject.complete();
		this.viewCheckedSubject.complete();
	}

	/**
	 * Called after the component view has been checked.
	 */
	public ngAfterViewChecked(): void {
		window.requestAnimationFrame(() => this.viewCheckedSubject.next());
	}

}
