import {EntityHandler} from "./entity-handler";
import {CircleHandler} from "./circle-handler";
import {LWPolylineHandler} from "./lw-polyline-handler";
import {ArcHandler} from "./arc-handler";
import {LineHandler} from "./line-handler";
import {MTextHandler} from "./mtext-handler";
import {SolidHandler} from "./solid-handler";
import {InsertHandler} from "./insert-handler";
import {PointHandler} from "./point-handler";
import {SplineHandler} from "./spline-handler";
import {EllipseHandler} from "./ellipse-handler";
import {ThreeDFaceHandler} from "./threedface-handler";
import {PolylineHandler} from "./polyline-handler";
import {VertexHandler} from "./vertex-handler";

/**
 * Collection of available entity handlers.
 */
export class EntityHandlers {

	/**
	 * Available entity handlers mapped by the types they can deal with.
	 */
	private static readonly HANDLERS: Map<string, EntityHandler> = new Map<string, EntityHandler>([
		[CircleHandler.TYPE, new CircleHandler()],
		[LWPolylineHandler.TYPE, new LWPolylineHandler()],
		[ArcHandler.TYPE, new ArcHandler()],
		[LineHandler.TYPE, new LineHandler()],
		[MTextHandler.TYPE, new MTextHandler()],
		[SolidHandler.TYPE, new SolidHandler()],
		[InsertHandler.TYPE, new InsertHandler()],
		[PointHandler.TYPE, new PointHandler()],
		[VertexHandler.TYPE, new VertexHandler()],
		[SplineHandler.TYPE, new SplineHandler()],
		[EllipseHandler.TYPE, new EllipseHandler()],
		[ThreeDFaceHandler.TYPE, new ThreeDFaceHandler()],
		[PolylineHandler.TYPE, new PolylineHandler()],
	]);

	/**
	 * Get a handler for the passed type.
	 * @param type of the handler to fetch
	 */
	public static getHandler(type: string): EntityHandler | null {
		return this.HANDLERS.get(type);
	}

}
