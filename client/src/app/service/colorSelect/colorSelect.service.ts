import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

/**
 * Color Selector Service for the application.
 */
@Injectable({
	providedIn: "root"
})
export class ColorSelectService {

	/**
	 * Variable for storing the color that is currently selected by the color picker.
	 */
	private _catColor: string;

	/**
	 * Variable for storing the category that has been selected on the legend.
	 */
	private _catNumber: number;

	/**
	 * Subject for the event of a color change.
	 */
	private colorChangeEvent = new BehaviorSubject<string>("");


	constructor(){
	}


	/**
	 * Get Category Color
	 */
	public get getCatColor(): string{
		return this._catColor;
	}

	/**
	 * Set Category Color
	 */
	setCatColor(val: string): void {
		this._catColor = val;
	}

	/**
	 * Get Category Number
	 */
	public get getCatNumber(): number {
		return this._catNumber;
	}

	/**
	 * Set Category Number
	 */
	setCatNumber(value: number): void {
		this._catNumber = value;
	}

	/**
	 * Emit a color change event.
	 */
	emitColorChangeEvent(msg: string): void{
		this.colorChangeEvent.next(msg);
	}

	/**
	 * Returns an observable which allows to listen to color change events.
	 */
	colorChangeListener(): Observable<any> {
		return this.colorChangeEvent.asObservable();
	}
}
