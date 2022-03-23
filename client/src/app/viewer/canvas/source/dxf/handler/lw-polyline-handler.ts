import {AbstractEntityHandler} from "./abstract-entity-handler";
import {Dxf, DxfEntity, DxfLWPolylineEntity, DxfPolylineVertex} from "../dxf";
import {BufferGeometry, Line, LineBasicMaterial, Material, MeshBasicMaterial, Object3D, Shape, ShapeBufferGeometry, Vector2} from "three";
import {DxfCanvasSource} from "../dxf-canvas-source";
import {DxfGlobals} from "../util/dxf-globals";

/**
 * Handler being able to process LWPolyline (lightweight polyline) entities.
 */
export class LWPolylineHandler extends AbstractEntityHandler {

	/**
	 * Type the handler is able to process.
	 */
	public static readonly TYPE: string = "LWPOLYLINE";

	/**
	 * Process the passed entity.
	 * @param entity to process
	 * @param dxf the DXF format
	 * @param src the canvas source object
	 */
	public process(entity: DxfEntity, dxf: Dxf, src: DxfCanvasSource): Object3D {
		const e: DxfLWPolylineEntity = entity as DxfLWPolylineEntity;

		const vertices: DxfPolylineVertex[] = [...e.vertices];
		if (e.closed) {
			vertices.push(e.vertices[0]);
		}

		const shape: Shape = new Shape();
		let containedBulge: boolean = false;
		for (let i = 0; i < vertices.length; i++) {
			const vertex: DxfPolylineVertex = vertices[i];
			if (!!vertex.z) {
				vertex.z = 0;
			}

			if (i === 0) {
				shape.moveTo(vertex.x, vertex.y);
			}

			if (!!vertex.bulge && vertex.bulge !== 0 && i < vertices.length - 1) {
				// Calculate distance to the next vertex
				const nextVertex: DxfPolylineVertex = vertices[i + 1];

				const data: ArcData = LWPolylineHandler.bulgeToArc(
					new Vector2(vertex.x, vertex.y),
					new Vector2(nextVertex.x, nextVertex.y),
					vertex.bulge
				);

				shape.absarc(
					data.center.x,
					data.center.y,
					data.radius,
					data.startAngle,
					data.endAngle,
					vertex.bulge < 0
				);

				containedBulge = true;
			} else {
				shape.lineTo(vertex.x, vertex.y);
			}
		}

		if (e.closed) {
			shape.closePath();
		}

		// TODO Support different line types (dashed, dotted, ...).

		const geometry: BufferGeometry = new BufferGeometry().setFromPoints(shape.getPoints(DxfGlobals.divisions));
		const color: number = this.retrieveColor(entity, dxf);
		const material: Material = new LineBasicMaterial({linewidth: e.thickness ?? 1, color: color});

		if (containedBulge) {
			src.addVerticesToTransformForRoomMappings(e.vertices, new ShapeBufferGeometry(shape));
		}

		const line: Line = new Line(geometry, material);
		src.addMappingRoom(line, shape);

		return line;
	}

	/**
	 * Convert a the passed bulge to info needed to build an arc.
	 * @param start point
	 * @param end point
	 * @param bulge to convert
	 */
	private static bulgeToArc(start: Vector2, end: Vector2, bulge: number): ArcData {
		const bulgeAngle: number = 4 * Math.atan(bulge);
		const halfBulgeAngle: number = bulgeAngle / 2;

		const distance: number = start.distanceTo(end);
		const radius: number = distance / 2 / Math.sin(halfBulgeAngle);

		const angleBetweenPoints: number = Math.atan2(end.y - start.y, end.x - start.x);
		const angle: number = Math.PI / 2 - halfBulgeAngle + angleBetweenPoints;

		const center: Vector2 = new Vector2(
			start.x + radius * Math.cos(angle),
			start.y + radius * Math.sin(angle)
		);

		const angleEnd: number = Math.atan2(end.y - center.y, end.x - center.x);
		const angleStart: number = Math.atan2(start.y - center.y, start.x - center.x);

		return {
			center,
			startAngle: angleStart,
			endAngle: angleEnd,
			radius: Math.abs(radius)
		};
	}

}

interface ArcData {
	center: Vector2;
	startAngle: number;
	endAngle: number;
	radius: number;
}
