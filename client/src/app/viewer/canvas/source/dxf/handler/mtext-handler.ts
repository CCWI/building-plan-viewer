import {AbstractEntityHandler} from "./abstract-entity-handler";
import {Dxf, DxfEntity, DxfMTextEntity} from "../dxf";
import {Box3, Font, FontLoader, Material, Mesh, MeshBasicMaterial, Object3D, TextGeometry} from "three";
import {DxfCanvasSource} from "../dxf-canvas-source";
import {FontUtil} from "../../../../../util/font/font-util";

/**
 * Handler being able to process MText entities.
 */
export class MTextHandler extends AbstractEntityHandler {

	/**
	 * Type the handler is able to process.
	 */
	public static readonly TYPE: string = "MTEXT";

	/**
	 * Load the font to use for three.js.
	 */
	private static loadFont(): Font {
		const loader: FontLoader = new FontLoader();
		return loader.parse(FontUtil.ROBOTO_REGULAR);
	}

	/**
	 * The font to use for three.js.
	 */
	private static font: Font;

	/**
	 * Get the font to use.
	 */
	public static getFont(): Font {
		if (!MTextHandler.font) {
			MTextHandler.font = MTextHandler.loadFont();
		}

		return MTextHandler.font;
	}

	/**
	 * Process the passed entity.
	 * @param entity to process
	 * @param dxf the DXF format
	 * @param src the canvas source object
	 */
	public process(entity: DxfEntity, dxf: Dxf, src: DxfCanvasSource): Object3D {
		const e: DxfMTextEntity = entity as DxfMTextEntity;

		const geometry: TextGeometry = new TextGeometry(e.string, {
			font: MTextHandler.font,
			height: 0,
			size: e.nominalTextHeight * 4 / 5
		});

		const material: Material = new MeshBasicMaterial({color: this.retrieveColor(entity, dxf)});

		const result: Mesh = new Mesh(geometry, material);
		result.position.z = e.z;

		const box: Box3 = new Box3().setFromObject(result);
		const width: number = box.max.x - box.min.x;

		// TODO Deal with multiline text

		MTextHandler.alignText(e, result, width, e.nominalTextHeight);

		return result;
	}

	/**
	 * Align the text mesh.
	 * @param e entity
	 * @param result text mesh
	 * @param width of the mesh
	 * @param height of the mesh
	 */
	private static alignText(e: DxfMTextEntity, result: Mesh, width: number, height: number) {
		switch (e.attachmentPoint) {
			case 1:
				// Align top left
				result.position.x = e.x;
				result.position.y = e.y - height;
				break;
			case 2:
				// Align top centered
				result.position.x = e.x - width / 2;
				result.position.y = e.y - height;
				break;
			case 3:
				// Align top right
				result.position.x = e.x - width;
				result.position.y = e.y - height;
				break;
			case 4:
				// Align to the left (centered)
				result.position.x = e.x;
				result.position.y = e.y - height / 2;
				break;
			case 5:
				// Align centered
				result.position.x = e.x - width / 2;
				result.position.y = e.y - height / 2;
				break;
			case 6:
				// Align to the right (centered)
				result.position.x = e.x - width;
				result.position.y = e.y - height / 2;
				break;
			case 7:
				// Align to the bottom left
				result.position.x = e.x;
				result.position.y = e.y;
				break;
			case 8:
				// Align to the bottom (centered)
				result.position.x = e.x - width / 2;
				result.position.y = e.y;
				break;
			case 9:
				// Align to the bottom right
				result.position.x = e.x - width;
				result.position.y = e.y;
				break;
			default:
				throw new Error(`MTEXT attachmentPoint with value ${e.attachmentPoint} is unknown`);
		}
	}

}
