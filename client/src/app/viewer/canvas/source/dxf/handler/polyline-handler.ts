import {LWPolylineHandler} from "./lw-polyline-handler";

/**
 * Handler being able to process Polyline entities.
 */
export class PolylineHandler extends LWPolylineHandler {

	/**
	 * Type the handler is able to process.
	 */
	public static readonly TYPE: string = "POLYLINE";

}
