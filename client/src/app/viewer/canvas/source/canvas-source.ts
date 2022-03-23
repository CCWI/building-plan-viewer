import {BufferGeometry, Camera, Scene} from "three";
import {Bounds3D} from "./util/bounds";
import {RoomMapping} from "../../../service/room-mapping/room-mapping";

/**
 * Source digestible by the canvas component.
 */
export interface CanvasSource {

	/**
	 * Draw the source on the given scene.
	 *
	 * @param scene to draw on
	 * @param progressConsumer consumer to publish the current progress in range [0; 100] over
	 */
	draw(scene: Scene, progressConsumer: (progress: number) => Promise<boolean>): Promise<Bounds3D>;

	/**
	 * Transform the given room mapping.
	 * This method gives the canvas source the opportunity to improve
	 * or simply transform any room mapping.
	 * For example for DXF when the room mapping points to a already painted polyline that
	 * features bulges, the display is improved by returning the proper vertices that include
	 * the bulges.
	 *
	 * @param mapping to transform
	 * @param scene of the canvas
	 * @param camera of the canvas
	 */
	mapToRoom(mapping: RoomMapping, scene: Scene, camera: Camera): BufferGeometry;

}
