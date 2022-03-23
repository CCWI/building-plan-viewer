import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild} from "@angular/core";
import colormap from "colormap";

/**
 * Icon for a colormap.
 */
@Component({
	selector: "app-colormap-icon-component",
	templateUrl: "colormap-icon.component.html",
	styleUrls: ["colormap-icon.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColormapIconComponent implements AfterViewInit {

	/**
	 * Name of the colormap to visualize.
	 */
	private _name: string;

	/**
	 * Shades to display.
	 */
	private _shades: number = 256;

	/**
	 * Canvas to draw on.
	 */
	@ViewChild("canvas")
	public canvas: ElementRef<HTMLCanvasElement>;

	/**
	 * Context of the canvas to draw on.
	 */
	private context: CanvasRenderingContext2D;

	/**
	 * Called after view initialization.
	 */
	public ngAfterViewInit(): void {
		this.context = this.canvas.nativeElement.getContext("2d");
		this._refresh();
	}

	/**
	 * Get the colormap name to visualize.
	 */
	get name(): string {
		return this._name;
	}

	/**
	 * Set the colormap name to visualize.
	 * @param value to set
	 */
	@Input()
	set name(value: string) {
		this._name = value;

		this._refresh();
	}

	/**
	 * Get the number of shades to display.
	 */
	get shades(): number {
		return this._shades;
	}

	/**
	 * Set the number of shades to display.
	 * @param value to set
	 */
	@Input()
	set shades(value: number) {
		this._shades = value;

		this._refresh();
	}

	/**
	 * Refresh the icon visualization.
	 */
	private _refresh(): void {
		if (!this.context) {
			return; // Not initialized yet
		}

		const hexColors: string[] = colormap({
			colormap: this._name,
			nshades: this._shades,
			format: "hex",
			alpha: 1.0
		});

		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
		const shadeWidth: number = this.context.canvas.width / this._shades;
		for (let shade = 0; shade < this._shades; shade++) {
			this.context.fillStyle = hexColors[shade];
			this.context.fillRect(shade * shadeWidth, 0, shadeWidth + 0.5, this.context.canvas.height);
		}
	}

}
