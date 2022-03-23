import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CADFileReference} from "../../../../service/cad/cad-file-reference";
import {RoomMappingService} from "../../../../service/room-mapping/room-mapping.service";
import {SelectRoomMappingDialogData} from "./select-room-mapping-dialog-data";
import {RoomMappingReference} from "../../../../service/room-mapping/room-mapping-reference";
import {SelectRoomMappingDialogResult} from "./select-room-mapping-dialog-result";
import {RoomMappingUploadDialogComponent} from "../upload/room-mapping-upload-dialog.component";
import {RoomMappingUploadDialogData} from "../upload/room-mapping-upload-dialog-data";
import colorScales from "colormap/colorScale";

/**
 * Component letting the user select a room mapping to display.
 */
@Component({
	selector: "app-select-room-mapping-dialog-component",
	templateUrl: "select-room-mapping-dialog.component.html",
	styleUrls: ["select-room-mapping-dialog.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectRoomMappingDialogComponent implements OnInit {

	/**
	 * Promise for loading CAD file references.
	 */
	public referencePromise: Promise<CADFileReference[]>;

	/**
	 * All available color maps.
	 */
	public readonly availableColormaps: string[];

	/**
	 * The currently selected color map.
	 */
	public selectedColormap: string;

	// TODO Let the user delete mappings and CAD files!

	constructor(
		private readonly cd: ChangeDetectorRef,
		private readonly dialogRef: MatDialogRef<SelectRoomMappingDialogComponent>,
		private readonly roomMappingService: RoomMappingService,
		private readonly dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) private readonly data: SelectRoomMappingDialogData,
	) {
		this.availableColormaps = Object.keys(colorScales);

		/**
		 * Called on component initialization.
		 */
		this.selectedColormap = this.availableColormaps[0];
	}

	/**
	 * Called on component initialization.
	 */
	public ngOnInit(): void {
		this.refresh();
	}

	/**
	 * Refresh the displayed mappings.
	 */
	private refresh(): void {
		this.referencePromise = this.roomMappingService.getAllForCADFileID(this.data.cadFileID).then((refs) => refs.sort((r1, r2) => {
			const date1: Date = new Date(r1.createdTimestamp);
			const date2: Date = new Date(r2.createdTimestamp);

			return date2.getTime() - date1.getTime();
		}));
	}

	/**
	 * On dialog cancellation.
	 */
	public onCancel(): void {
		this.dialogRef.close();
	}

	/**
	 * Called when a mapping has been selected.
	 * @param reference that has been selected
	 */
	public onSelect(reference: RoomMappingReference | null): void {
		this.dialogRef.close({
			colormap: this.selectedColormap,
			reference
		} as SelectRoomMappingDialogResult);
	}

	/**
	 * Called when a new mapping should be created.
	 */
	public onCreateMapping(): void {
		this.dialog.open(RoomMappingUploadDialogComponent, {
			hasBackdrop: true,
			data: {
				cadFileID: this.data.cadFileID
			} as RoomMappingUploadDialogData
		}).afterClosed().subscribe(() => {
			this.refresh();
			this.cd.markForCheck();
		});
	}

	/**
	 * Get a representation of the passed timestamp.
	 * @param timestamp to convert
	 */
	public getCreatedDateRepresentation(timestamp: string): string {
		const date: Date = new Date(timestamp);

		const hours: string = `${date.getHours()}`;
		const minutes: string = `${date.getMinutes()}`;
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
	}

}
