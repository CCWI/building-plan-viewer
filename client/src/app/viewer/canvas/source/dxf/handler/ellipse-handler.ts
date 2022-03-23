import {AbstractEntityHandler} from "./abstract-entity-handler";
import {Dxf, DxfEllipseEntity, DxfEntity} from "../dxf";
import {BufferGeometry, EllipseCurve, Line, LineBasicMaterial, Material, Object3D} from "three";
import {DxfCanvasSource} from "../dxf-canvas-source";
import {DxfGlobals} from "../util/dxf-globals";

/**
 * Handler being able to process Ellipse entities.
 */
export class EllipseHandler extends AbstractEntityHandler {

	/**
	 * Type the handler is able to process.
	 */
	public static readonly TYPE: string = "ELLIPSE";

	/**
	 * Process the passed entity.
	 * @param entity to process
	 * @param dxf the DXF format
	 * @param src the canvas source object
	 */
	public process(entity: DxfEntity, dxf: Dxf, src: DxfCanvasSource): Object3D {
		const e: DxfEllipseEntity = entity as DxfEllipseEntity;

		const radiusX: number = Math.hypot(e.majorX, e.majorY);
		const radiusY: number = radiusX * e.axisRatio;
		const rotation: number = Math.atan2(e.majorY, e.majorX);

		const ellipse: EllipseCurve = new EllipseCurve(
			e.x,
			e.y,
			radiusX,
			radiusY,
			e.startAngle,
			e.endAngle,
			false,
			rotation
		);

		const geometry: BufferGeometry = new BufferGeometry().setFromPoints(ellipse.getPoints(DxfGlobals.divisions));
		const material: Material = new LineBasicMaterial({linewidth: 1, color: this.retrieveColor(entity, dxf)});

		return new Line(geometry, material);
	}

}
