import {ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatVerticalStepper} from "@angular/material/stepper";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UploadDialogData} from "./upload-dialog-data";
import {FileUtil} from "../../../../util/file-util";
import {CanvasSourceReaders} from "../../../canvas/source/canvas-source-readers";
import {CADFileReference} from "../../../../service/cad/cad-file-reference";
import {CADFile} from "../../../../service/cad/cad-file";
import {CADFileService} from "../../../../service/cad/cad-file.service";

/**
 * Dialog component for uploading a CAD file.
 */
@Component({
	selector: "app-upload-dialog-component",
	templateUrl: "upload-dialog.component.html",
	styleUrls: ["upload-dialog.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogComponent implements OnInit {

	/**
	 * Form group for uploading a file.
	 */
	public uploadFormGroup: FormGroup;

	/**
	 * Stepper component.
	 */
	@ViewChild(MatVerticalStepper)
	public stepper: MatVerticalStepper;

	/**
	 * Selected file to upload.
	 */
	private selectedFile: File;

	/**
	 * The resulting reference to the uploaded CAD file.
	 */
	private resultingReference: CADFileReference;

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly snackBar: MatSnackBar,
		private readonly dialogRef: MatDialogRef<UploadDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private readonly data: UploadDialogData,
		private readonly cadFileService: CADFileService
	) {
		this.selectedFile = data.file;
	}

	/**
	 * Called on component initialization.
	 */
	public ngOnInit(): void {
		this.uploadFormGroup = this.formBuilder.group({
			selectedFileCtrl: [{value: !!this.selectedFile ? this.selectedFile.name : "", disabled: true}, Validators.required]
		});
	}

	/**
	 * Called when a file should be selected.
	 */
	public async onSelectFile(): Promise<void> {
		const file = (await FileUtil.openFileChooser(
			Array.from(CanvasSourceReaders.getSupportedFileEndings()).map(e => `.${e}`)
		))[0];

		this.selectedFile = file;
		this.uploadFormGroup.setValue({selectedFileCtrl: file.name});
	}

	/**
	 * Called when the upload should start.
	 */
	public async onUpload(): Promise<void> {
		if (!!this.selectedFile) {
			const fileEnding: string = FileUtil.getFileEnding(this.selectedFile);
			if (!CanvasSourceReaders.getSupportedFileEndings().has(fileEnding)) {
				const supportedFileEndings = Array.from(CanvasSourceReaders.getSupportedFileEndings());
				supportedFileEndings.sort();

				this.snackBar.open(
					`The viewer currently supports only CAD files with the following file endings: ${supportedFileEndings.map(e => `*.${e}`).join(", ")}`,
					"OK",
					{
						duration: 5000,
					}
				);
				return;
			}

			this.stepper.next();

			const base64FileContents: string = await FileUtil.readFileBase64(this.selectedFile);
			const cadFile: CADFile = {
				name: this.selectedFile.name,
				type: "DXF",
				data: base64FileContents,
				charsetName: "utf-8"
			};
			this.resultingReference = await this.cadFileService.create(cadFile);
			this.snackBar.open(`CAD file with name '${this.resultingReference.name}' has been uploaded`, "OK", {
				duration: 3000
			});

			this.stepper.next();
		}
	}

	/**
	 * On dialog cancellation.
	 */
	public onCancel(): void {
		this.dialogRef.close();
	}

	/**
	 * Called on dialog finishing.
	 * @param openFile whether to directly open the file after closing the dialog
	 */
	public onFinish(openFile: boolean): void {
		this.dialogRef.close(openFile ? this.resultingReference : null);
	}

}
