import {AbstractEntityHandler} from "./abstract-entity-handler";
import {Dxf, DxfEntity, DxfLineEntity} from "../dxf";
import {Geometry, Line, LineBasicMaterial, Material, Object3D, Vector3} from "three";
import {DxfCanvasSource} from "../dxf-canvas-source";

/**
 * Handler being able to process Line entities.
 */
export class LineHandler extends AbstractEntityHandler {

	/**
	 * Type the handler is able to process.
	 */
	public static readonly TYPE: string = "LINE";

	/**
	 * Process the passed entity.
	 * @param entity to process
	 * @param dxf the DXF format
	 * @param src the canvas source object
	 */
	public process(entity: DxfEntity, dxf: Dxf, src: DxfCanvasSource): Object3D {
		const e: DxfLineEntity = entity as DxfLineEntity;

		const geometry: Geometry = new Geometry();
		geometry.vertices.push(new Vector3(e.start.x, e.start.y, !!e.start.z ? e.start.z : 0));
		geometry.vertices.push(new Vector3(e.end.x, e.end.y, !!e.end.z ? e.end.z : 0));

		const color: number = this.retrieveColor(entity, dxf);
		const material: Material = new LineBasicMaterial({linewidth: e.thickness ?? 1, color: color});

		return new Line(geometry, material);
	}

}
