import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {ColorSelectService} from "../../service/colorSelect/colorSelect.service";
import {toNumbers} from "@angular/compiler-cli/src/diagnostics/typescript_version";

/**
 * Component displaying a legend for a color map.
 */
@Component({
	selector: "app-legend-component",
	templateUrl: "legend.component.html",
	styleUrls: ["legend.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegendComponent implements OnDestroy {


	/**
	 * Available categories and their color.
	 */
	private _mapping: Map<string, string> = new Map<string, string>();

	/**
	 * Subject emitting events when a Color Button on the Legend has been clicked.
	 */
	public _onSingleColorChangeSubject: Subject<void> = new Subject<void>();

	constructor(
		private readonly cd: ChangeDetectorRef,
		private colorSelectService: ColorSelectService,
	) {
	}

	/**
	 * Called on component destruction.
	 */
	public ngOnDestroy(): void {
		this._onSingleColorChangeSubject.complete();
	}

	/**
	 * Set the mapping to display.
	 * @param mapping
	 */
	@Input()
	public set mapping(mapping: Map<string, string>) {
		this._mapping = mapping;
		this.cd.markForCheck();
	}

	/**
	 * Get the available mapping.
	 */
	public get mapping(): Map<string, string> {
		return this._mapping;
	}

	/**
	 * Called when an Item on the Legend has been clicked.
	 * Stores the Category Number in a global variable
	 * Then emits event within the Color Select Service to redraw legend and canvas
	 */
	public onSingleColorChangeClicked(catNum): void {
		this.colorSelectService.setCatNumber(catNum);
		this.colorSelectService.emitColorChangeEvent("Clicked");
	}
}
