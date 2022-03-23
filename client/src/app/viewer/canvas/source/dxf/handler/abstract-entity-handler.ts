import {EntityHandler} from "./entity-handler";
import {Object3D} from "three";
import {Dxf, DxfEntity, DxfLayer} from "../dxf";
import {DxfGlobals} from "../util/dxf-globals";
import {DxfCanvasSource} from "../dxf-canvas-source";

/**
 * Abstract entity handler.
 */
export abstract class AbstractEntityHandler implements EntityHandler {

	/**
	 * Maximum allowed color difference between two colors to be considered distinctive.
	 */
	private static readonly MAX_DISTINCT_COLOR_DIFF: number = 0x300000;

	/**
	 * Process the passed entity.
	 * @param entity to process
	 * @param dxf the DXF format
	 * @param src the canvas source object
	 */
	abstract process(entity: DxfEntity, dxf: Dxf, src: DxfCanvasSource): Object3D;

	/**
	 * Retrieve a color from the passed entity and DXF.
	 * @param entity to get color from
	 * @param dxf to get color from
	 */
	protected retrieveColor(entity: DxfEntity, dxf: Dxf): number {
		if (!!entity.colorNumber) {
			return AbstractEntityHandler.makeSureColorIsDistinctFromBackground(entity.colorNumber);
		} else if (!!dxf.tables && !!dxf.tables.layers && !!dxf.tables.layers[entity.layer]) {
			const layer: DxfLayer = dxf.tables.layers[entity.layer];
			return AbstractEntityHandler.makeSureColorIsDistinctFromBackground(layer.colorNumber);
		} else {
			return DxfGlobals.getContrastColor();
		}
	}

	/**
	 * Function making sure the passed color is distinct from the background color.
	 * @param color to check/convert
	 */
	private static makeSureColorIsDistinctFromBackground(color: number): number {
		const diff: number = Math.abs(color - DxfGlobals.getBackgroundColor());

		if (diff < AbstractEntityHandler.MAX_DISTINCT_COLOR_DIFF) {
			return 0xFFFFFF - color;
		}

		return color;
	}

}
