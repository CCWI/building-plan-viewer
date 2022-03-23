import {AbstractEntityHandler} from "./abstract-entity-handler";
import {Dxf, DxfEntity, DxfSplineEntity} from "../dxf";
import {
	BufferGeometry,
	Line,
	LineBasicMaterial,
	Material,
	Object3D,
	QuadraticBezierCurve,
	QuadraticBezierCurve3,
	SplineCurve,
	Vector2,
	Vector3
} from "three";
import {Curve} from "three/src/extras/core/Curve";
import {DxfCanvasSource} from "../dxf-canvas-source";
import {DxfGlobals} from "../util/dxf-globals";

/**
 * Handler being able to process Spline entities.
 */
export class SplineHandler extends AbstractEntityHandler {

	/**
	 * Type the handler is able to process.
	 */
	public static readonly TYPE: string = "SPLINE";

	/**
	 * Process the passed entity.
	 * @param entity to process
	 * @param dxf the DXF format
	 * @param src the canvas source object
	 */
	public process(entity: DxfEntity, dxf: Dxf, src: DxfCanvasSource): Object3D {
		const e: DxfSplineEntity = entity as DxfSplineEntity;

		const curves: Curve<Vector2 | Vector3>[] = this.getCurves(e);
		const interpolated: Array<Vector2 | Vector3> = this.interpolateCurves(curves);

		if (e.closed) {
			interpolated.push(interpolated[0]);
		}

		const geometry: BufferGeometry = new BufferGeometry().setFromPoints(interpolated.map(p => {
			if (p instanceof Vector2) {
				return p;
			} else {
				return new Vector2(p.x, p.y);
			}
		}));

		const color: number = this.retrieveColor(entity, dxf);
		const material: Material = new LineBasicMaterial({linewidth: 1, color: color});

		return new Line(geometry, material);
	}

	/**
	 * Interpolate the passed curves.
	 * @param curves to interpolate
	 */
	private interpolateCurves(curves: Curve<Vector2 | Vector3>[]): Array<Vector2 | Vector3> {
		const result: Array<Vector2 | Vector3> = [];

		for (const curve of curves) {
			for (const p of curve.getPoints(DxfGlobals.divisions)) {
				result.push(p);
			}
		}

		return result;
	}

	/**
	 * Get curves for the spline entity.
	 * @param e entity to get curves for
	 */
	private getCurves(e: DxfSplineEntity): Curve<Vector2 | Vector3>[] {
		const controlPoints: Vector3[] = e.controlPoints.map(p => new Vector3(p.x, p.y, p.z ?? 0));

		const result: Curve<Vector2 | Vector3>[] = [];
		if (e.degree === 2 || e.degree === 3) {
			for (let i = 0; i < controlPoints.length - 2; i += 2) {
				const cp1: Vector3 = controlPoints[i];
				const cp2: Vector3 = controlPoints[i + 1];
				const cp3: Vector3 = controlPoints[i + 2];

				if (e.degree === 2) {
					result.push(new QuadraticBezierCurve(
						new Vector2(cp1.x, cp1.y),
						new Vector2(cp2.x, cp2.y),
						new Vector2(cp3.x, cp3.y)
					));
				} else {
					result.push(new QuadraticBezierCurve3(cp1, cp2, cp3));
				}
			}
		} else {
			result.push(new SplineCurve(controlPoints.map(p => new Vector2(p.x, p.y))));
		}

		return result;
	}

}
