import {Object3D} from "three";
import {Dxf, DxfEntity} from "../dxf";
import {DxfCanvasSource} from "../dxf-canvas-source";

/**
 * Handler dealing with drawing DXF entities.
 */
export interface EntityHandler {

	/**
	 * Process the passed entity.
	 * @param entity to process
	 * @param dxf the DXF format
	 * @param src the canvas source object
	 */
	process(entity: DxfEntity, dxf: Dxf, src: DxfCanvasSource): Object3D;

}
