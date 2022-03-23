import {PointHandler} from "./point-handler";

/**
 * Handler being able to process Vertex entities.
 */
export class VertexHandler extends PointHandler {

	/**
	 * Type the handler is able to process.
	 */
	public static readonly TYPE: string = "VERTEX";

}
