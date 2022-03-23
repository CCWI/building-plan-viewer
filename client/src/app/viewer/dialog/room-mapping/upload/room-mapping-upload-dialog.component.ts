import {ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatVerticalStepper} from "@angular/material/stepper";
import {RoomMappingUploadDialogData} from "./room-mapping-upload-dialog-data";
import {NgxCsvParser, NgxCSVParserError} from "ngx-csv-parser";
import {FileUtil} from "../../../../util/file-util";
import {first} from "rxjs/operators";
import {RoomMapping} from "../../../../service/room-mapping/room-mapping";
import {Vertex} from "../../../../service/room-mapping/vertex";
import {RoomMappingService} from "../../../../service/room-mapping/room-mapping.service";
import {RoomMappingCollection} from "../../../../service/room-mapping/room-mapping-collection";
import {RoomMappingReference} from "../../../../service/room-mapping/room-mapping-reference";
import {MatSnackBar} from "@angular/material/snack-bar";

/**
 * Component for uploading room mappings.
 */
@Component({
	selector: "app-room-mapping-upload-dialog-component",
	templateUrl: "room-mapping-upload-dialog.component.html",
	styleUrls: ["room-mapping-upload-dialog.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomMappingUploadDialogComponent implements OnInit {

	/**
	 * Form group for defining a room mapping.
	 */
	public mappingFormGroup: FormGroup;

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
	 * The resulting room mapping reference of the uploaded mapping.
	 */
	private resultingReference: RoomMappingReference | null = null;

	constructor(
		private readonly dialogRef: MatDialogRef<RoomMappingUploadDialogComponent>,
		private readonly csvParser: NgxCsvParser,
		private readonly formBuilder: FormBuilder,
		private readonly roomMappingService: RoomMappingService,
		private readonly snackBar: MatSnackBar,
		@Inject(MAT_DIALOG_DATA) private readonly data: RoomMappingUploadDialogData,
	) {
		this.selectedFile = data.file;
	}

	/**
	 * Called on component initialization.
	 */
	public ngOnInit(): void {
		this.mappingFormGroup = this.formBuilder.group({
			selectedFileCtrl: [{value: !!this.selectedFile ? this.selectedFile.name : "", disabled: true}, Validators.required],
			delimiter: [",", Validators.required],
			roomNameHeader: ["RoomNumber", Validators.required],
			categoryHeader: ["Cluster", Validators.required],
			descriptionHeader: ["Description", Validators.required],
			mappingVertexHeader: ["MappingVertex", Validators.required],
			polygonListHeader: ["Polygon", Validators.required],
		});
	}

	/**
	 * On dialog cancellation.
	 */
	public onCancel(): void {
		this.dialogRef.close();
	}

	/**
	 * Called when a csv file should be selected.
	 */
	public async onSelectCSVFile(): Promise<void> {
		const file = (await FileUtil.openFileChooser([".csv"]))[0];

		this.selectedFile = file;
		this.mappingFormGroup.controls.selectedFileCtrl.setValue(file.name);
	}

	/**
	 * Read the mapping from the selected CSV file.
	 * @param delimiter to use for parsing
	 * @param roomNameHeader header name of the room name CSV header
	 * @param categoryHeader header name of the category CSV header
	 * @param descriptionHeader header name of the description CSV header
	 * @param mappingVertexHeader header name of the mapping vertex CSV header
	 * @param polygonListHeader header name of the polygon list CSV header
	 */
	private async readMappingFromCSV(
		delimiter: string,
		roomNameHeader: string,
		categoryHeader: string,
		descriptionHeader: string,
		mappingVertexHeader: string,
		polygonListHeader: string
	): Promise<RoomMapping[]> {
		const entries: any[] | NgxCSVParserError = await this.csvParser
			.parse(this.selectedFile, {delimiter, header: true})
			.pipe(first())
			.toPromise();

		if (entries instanceof NgxCSVParserError) {
			throw new Error("Could not parse the provided CSV");
		} else {
			// Map entries to room mapping entries.
			const result: RoomMapping[] = [];
			for (const entry of entries) {
				// Parse polygon list (if any).
				const vertices: Vertex[] = [];
				let polygonStr: string = entry[polygonListHeader];
				if (!!polygonStr) {
					polygonStr = polygonStr.substring(1, polygonStr.length - 1);
					const parts: string[] = polygonStr.split(",");

					for (let i = 0; i < parts.length; i += 2) {
						const first: string = parts[i].trim().substring(1);
						const second: string = parts[i + 1].substring(0, parts[i + 1].length - 1).trim();

						vertices.push({
							x: parseFloat(first),
							y: parseFloat(second)
						} as Vertex);
					}
				}

				// Parse mapping vertex (if any).
				let mappingVertex: Vertex = null;
				const mappingVertexStr: string = entry[mappingVertexHeader];
				if (!!mappingVertexStr) {
					const parts: string[] = mappingVertexStr.split(",");
					const first: string = parts[0].trim().substring(1);
					const second: string = parts[1].substring(0, parts[1].length - 1).trim();

					mappingVertex = {
						x: parseFloat(first),
						y: parseFloat(second)
					};
				}

				result.push({
					roomName: entry[roomNameHeader],
					category: entry[categoryHeader],
					description: entry[descriptionHeader],
					mappingVertex: mappingVertex,
					vertices
				} as RoomMapping);
			}

			return result;
		}
	}

	/**
	 * Called when the upload should start.
	 */
	public async onUpload(): Promise<void> {
		if (!!this.selectedFile) {
			this.stepper.next();

			const roomMappings: RoomMapping[] = await this.readMappingFromCSV(
				this.mappingFormGroup.controls.delimiter.value,
				this.mappingFormGroup.controls.roomNameHeader.value,
				this.mappingFormGroup.controls.categoryHeader.value,
				this.mappingFormGroup.controls.descriptionHeader.value,
				this.mappingFormGroup.controls.mappingVertexHeader.value,
				this.mappingFormGroup.controls.polygonListHeader.value
			);

			const roomMappingCollection: RoomMappingCollection = {
				cadFileID: this.data.cadFileID,
				name: this.selectedFile.name,
				mappings: roomMappings
			};

			this.resultingReference = await this.roomMappingService.create(roomMappingCollection);
			this.snackBar.open(`Room mapping with name '${this.resultingReference.name}' has been uploaded`, "OK", {
				duration: 3000
			});

			this.stepper.next();
		}
	}

	/**
	 * Called on dialog finishing.
	 */
	public onFinish(): void {
		this.dialogRef.close(this.resultingReference);
	}

}
