import {AbstractEntityHandler} from "./abstract-entity-handler";
import {Dxf, DxfBlock, DxfEntity, DxfInsertEntity} from "../dxf";
import {Object3D} from "three";
import {EntityHandler} from "./entity-handler";
import {DxfCanvasSource} from "../dxf-canvas-source";
import {EntityHandlers} from "./entity-handlers";

/**
 * Handler being able to process Insert entities.
 */
export class InsertHandler extends AbstractEntityHandler {

	/**
	 * Type the handler is able to process.
	 */
	public static readonly TYPE: string = "INSERT";

	/**
	 * Process the passed entity.
	 * @param entity to process
	 * @param dxf the DXF format
	 * @param src the canvas source object
	 */
	public process(entity: DxfEntity, dxf: Dxf, src: DxfCanvasSource): Object3D {
		const e: DxfInsertEntity = entity as DxfInsertEntity;

		const block: DxfBlock = dxf.blocksByName.get(e.block);

		const group: Object3D = new Object3D();
		group.position.x = e.x ?? 0;
		group.position.y = e.y ?? 0;
		group.position.z = e.z ?? 0;

		if (!!block.entities) {
			for (const entity of block.entities) {
				const handler: EntityHandler = EntityHandlers.getHandler(entity.type);
				if (!handler) {
					throw new Error(`Entity type '${entity.type}' is not supported`);
				}

				const object: Object3D = handler.process(entity, dxf, src);

				group.add(object);
			}
		}

		return group;
	}

}
