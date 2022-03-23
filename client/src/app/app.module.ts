import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";

import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatButtonModule} from "@angular/material/button";
import {ViewerComponent} from "./viewer/viewer.component";
import {ControlsComponent} from "./viewer/controls/controls.component";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {CanvasComponent} from "./viewer/canvas/canvas.component";
import {MatDialogModule} from "@angular/material/dialog";
import {LoadingDialogComponent} from "./viewer/dialog/loading/component/loading-dialog.component";
import {LoadingDialogService} from "./viewer/dialog/loading/service/loading-dialog.service";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {LocalSettingsService} from "./util/settings/local-settings.service";
import {ThemeService} from "./util/theme/theme.service";
import {MatStepperModule} from "@angular/material/stepper";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {NgxCsvParserModule} from "ngx-csv-parser";
import {MatExpansionModule} from "@angular/material/expansion";
import {HttpClientModule} from "@angular/common/http";
import {CADFileService} from "./service/cad/cad-file.service";
import {RoomMappingService} from "./service/room-mapping/room-mapping.service";
import {MatListModule} from "@angular/material/list";
import {OpenDialogComponent} from "./viewer/dialog/cad/open/open-dialog.component";
import {UploadDialogComponent} from "./viewer/dialog/cad/upload/upload-dialog.component";
import {RoomMappingUploadDialogComponent} from "./viewer/dialog/room-mapping/upload/room-mapping-upload-dialog.component";
import {SelectRoomMappingDialogComponent} from "./viewer/dialog/room-mapping/select/select-room-mapping-dialog.component";
import {MarkdownModule} from "ngx-markdown";
import {LegendComponent} from "./viewer/legend/legend.component";
import {ColormapIconComponent} from "./viewer/dialog/room-mapping/select/colormap-icon/colormap-icon.component";
import {MatSelectModule} from "@angular/material/select";
import {SettingsService} from "./service/settings/settings.service";
import {ExportService} from "./service/export/export.service";
import {NgxColorsModule} from "ngx-colors";
import {ColorSelectService} from "./service/colorSelect/colorSelect.service";
import {ColorPickerModule} from "ngx-color-picker";

const materialModules: any[] = [
	MatButtonModule,
	MatIconModule,
	MatTooltipModule,
	MatSnackBarModule,
	MatDialogModule,
	MatProgressBarModule,
	MatSlideToggleModule,
	MatStepperModule,
	MatProgressSpinnerModule,
	MatFormFieldModule,
	MatInputModule,
	MatExpansionModule,
	MatListModule,
	MatSelectModule
];

@NgModule({
	declarations: [
		AppComponent,
		ViewerComponent,
		ControlsComponent,
		CanvasComponent,
		LoadingDialogComponent,
		UploadDialogComponent,
		OpenDialogComponent,
		RoomMappingUploadDialogComponent,
		SelectRoomMappingDialogComponent,
		LegendComponent,
		ColormapIconComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		NgxColorsModule,
		HttpClientModule,
		BrowserAnimationsModule,
		ReactiveFormsModule,
		...materialModules,
		NgxCsvParserModule,
		MarkdownModule.forRoot(),
		FormsModule,
		ColorPickerModule
	],
	providers: [
		LoadingDialogService,
		LocalSettingsService,
		ThemeService,
		CADFileService,
		RoomMappingService,
		SettingsService,
		ExportService,
		ColorSelectService
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
