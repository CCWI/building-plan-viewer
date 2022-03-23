/**
 * Configuration fot the loading dialog.
 */
export interface LoadingDialogConfig {

	/**
	 * Loading message (What is currently done?).
	 */
	message: string;

	/**
	 * Whether cancelling the dialog is allowed.
	 */
	cancelAllowed?: boolean;

	/**
	 * Current progress of the dialog.
	 * If this is null or undefined a indeterminate progress indicator will
	 * be shown.
	 * Must be in range 0 to 100.
	 */
	progress?: number;

}
