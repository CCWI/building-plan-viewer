import {AbstractEntityHandler} from "./abstract-entity-handler";
import {Dxf, DxfEntity, DxfPointEntity} from "../dxf";
import {Geometry, Material, Object3D, Points, PointsMaterial, Vector3} from "three";
import {DxfCanvasSource} from "../dxf-canvas-source";

/**
 * Handler being able to process Point entities.
 */
export class PointHandler extends AbstractEntityHandler {

	/**
	 * Type the handler is able to process.
	 */
	public static readonly TYPE: string = "POINT";

	/**
	 * Process the passed entity.
	 * @param entity to process
	 * @param dxf the DXF format
	 * @param src the canvas source object
	 */
	public process(entity: DxfEntity, dxf: Dxf, src: DxfCanvasSource): Object3D {
		const e: DxfPointEntity = entity as DxfPointEntity;

		const geometry: Geometry = new Geometry();
		geometry.vertices.push(new Vector3(e.x, e.y, e.z));

		const color: number = this.retrieveColor(entity, dxf);
		const material: Material = new PointsMaterial({size: e.thickness ?? 1, color: color});

		return new Points(geometry, material);
	}

}
