import {Injectable, OnDestroy} from "@angular/core";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {LoadingDialogComponent} from "../component/loading-dialog.component";
import {LoadingDialogConfig} from "../config/loading-dialog-config";
import {Observable, Subject, Subscription} from "rxjs";

/**
 * Service for displaying loading dialogs.
 */
@Injectable({
	providedIn: "root"
})
export class LoadingDialogService implements OnDestroy {

	/**
	 * Current dialog reference.
	 */
	private dialogRef: MatDialogRef<LoadingDialogComponent> | null = null;

	/**
	 * Subject where cancel events are published over.
	 */
	private readonly cancelSubject: Subject<void> = new Subject<void>();

	/**
	 * Subscriptions to dialog cancel events coming from the dialog component itself.
	 */
	private cancelEventSub: Subscription;

	constructor(
		private readonly dialog: MatDialog
	) {
	}

	/**
	 * Open a loading dialog using the passed configuration.
	 * If there is already an open dialog, it will be updated with the new configuration.
	 * A promise is returned that resolved when the dialog has been fully opened or updated.
	 * @param config to open/update dialog with
	 */
	public async open(config: LoadingDialogConfig): Promise<void> {
		return await new Promise<void>(
			resolve => {
				if (this.dialogRef === null) {
					this.dialogRef = this.dialog.open(LoadingDialogComponent, {
						data: config,
						hasBackdrop: true,
						disableClose: true,
					});


					this.dialogRef.afterOpened().subscribe(() => {
						if (!!this.dialogRef) {
							this.cancelEventSub = this.dialogRef.componentInstance.cancelEvents().subscribe(() => {
								this.cancelSubject.next();
							});
						}

						resolve();
					});
				} else {
					this.dialogRef.componentInstance.update(config);

					// Wait until dialog has been updated fully
					this.dialogRef.componentInstance.onNextViewChecked().subscribe(() => {
						resolve();
					});
				}
			}
		);
	}

	/**
	 * Observable of received cancel events.
	 */
	public cancelEvents(): Observable<void> {
		return this.cancelSubject.asObservable();
	}

	/**
	 * Close the loading dialog.
	 * If you have called the open method n times, you need to call
	 * this method n times as well in order to close the dialog entirely.
	 */
	public close(): void {
		if (this.dialogRef !== null) {
			this.dialogRef.close(); // Close dialog
			this.dialogRef = null;

			if (!!this.cancelEventSub) {
				this.cancelEventSub.unsubscribe();
			}
		}
	}

	/**
	 * Called on service destruction.
	 */
	public ngOnDestroy(): void {
		this.cancelSubject.complete();

		if (this.dialogRef !== null) {
			this.close();
		}
	}

}
