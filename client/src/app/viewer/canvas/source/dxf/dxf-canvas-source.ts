import {CanvasSource} from "../canvas-source";
import {Box3, BufferGeometry, Camera, Intersection, Object3D, Raycaster, Scene, Shape, ShapeBufferGeometry, Vector3} from "three";
import {Dxf, DxfEntity, DxfPosition} from "dxf";
import {EntityHandler} from "./handler/entity-handler";
import {EntityHandlers} from "./handler/entity-handlers";
import {Bounds3D} from "../util/bounds";
import {MTextHandler} from "./handler/mtext-handler";
import {RoomMapping} from "../../../../service/room-mapping/room-mapping";
import {Vertex} from "../../../../service/room-mapping/vertex";

/**
 * A canvas source read from DXF.
 */
export class DxfCanvasSource implements CanvasSource {

	/**
	 * Parsed DXF format.
	 */
	private readonly dxf: Dxf;

	/**
	 * Bounds of the drawn object.
	 */
	private bounds: Bounds3D = {
		x: {min: 0, max: 0},
		y: {min: 0, max: 0},
		z: {min: 0, max: 0},
	};

	/**
	 * All possible room objects we can map to.
	 */
	private possibleRoomObjects: Object3D[] = [];

	/**
	 * Shapes mapped by the object ids of the possibleRoomObjects.
	 */
	private possibleRoomObjectsShapes: Map<string, Shape> = new Map<string, Shape>();

	/**
	 * Raycaster used to lookup intersections in a Three.js scene.
	 */
	private readonly raycaster: Raycaster = new Raycaster();

	/**
	 * Map containing hashcodes for vertices that should be transformed in the
	 * transformRoomMapping method.
	 */
	private readonly roomMappingVerticesToTransform: Map<number, RoomMappingTransformEntry> = new Map<number, RoomMappingTransformEntry>();

	constructor(dxf: Dxf) {
		this.dxf = dxf;
	}

	/**
	 * Draw the source on the given scene.
	 * @param scene to draw on
	 * @param progressConsumer consumer to publish the current progress in range [0; 100] over
	 */
	public async draw(scene: Scene, progressConsumer: (progress: number) => Promise<boolean>): Promise<Bounds3D> {
		this.resetBounds();

		this.possibleRoomObjects = [];
		this.possibleRoomObjectsShapes.clear();

		const totalEntityCount: number = this.dxf.entities.length;
		let counter: number = 0;
		const publishProgressEvery: number = Math.round(totalEntityCount / 1000);
		for (const entity of this.dxf.entities) {
			try {
				this.drawEntity(entity, scene);
			} catch (e) {
				console.warn(e.message);
			}

			counter++;

			if (counter % publishProgressEvery === 0) {
				const cancelRequested: boolean = !(await progressConsumer(counter * 100 / totalEntityCount));
				if (cancelRequested) {
					break;
				}
			}
		}

		this.raycaster.params.Line.threshold = (this.bounds.x.max - this.bounds.x.min) / 100000;

		return this.bounds;
	}

	/**
	 * Calculate object size.
	 * @param object to calculate size of
	 */
	private static calculateObjectSize(object: Object3D): number {
		const bounds: Box3 = new Box3().setFromObject(object);
		return (bounds.max.x - bounds.min.x) * (bounds.max.y - bounds.min.y);
	}

	/**
	 * Map the passed vertex coordinates to an object.
	 * @param x x-coordinate of the vertex
	 * @param y y-coordinate of the vertex
	 * @param camera to use for raycasting
	 */
	private mapVertexToObject(x: number, y: number, camera: Camera): Object3D | null {
		let vector: Vector3 = new Vector3(x, y, 0);
		vector = vector.project(camera);

		this.raycaster.setFromCamera(vector, camera);

		const intersections: Intersection[] = this.raycaster.intersectObjects(this.possibleRoomObjects, true);
		if (intersections.length > 0) {
			let intersection: Intersection = intersections[0];
			if (intersections.length > 1) {
				// Take the smallest object that intersects to prevent getting the building boundaries
				const distance: number = intersection.distance;
				let minSize: number = DxfCanvasSource.calculateObjectSize(intersection.object);
				for (const int of intersections) {
					if (int.distance <= distance) {
						const newSize: number = DxfCanvasSource.calculateObjectSize(intersection.object);
						if (newSize < minSize) {
							minSize = newSize;
							intersection = int;
						}
					}
				}
			}

			return intersection.object;
		}

		return null;
	}

	/**
	 * Try to map the passed vertices to an exiting object in the scene.
	 * @param vertices to map
	 * @param camera to use for raycasting
	 */
	private mapVerticesToObject(vertices: DxfPosition[], camera: Camera): Object3D | null {
		let firstObject: Object3D | null = null;

		for (let i = 0; i < Math.min(3, vertices.length); i++) {
			const vertex: DxfPosition = vertices[i];
			const object: Object3D | null = this.mapVertexToObject(vertex.x, vertex.y, camera);
			if (!firstObject) {
				firstObject = object;
			} else {
				if (firstObject.uuid !== object.uuid) {
					return null; // Could not find object
				}
			}
		}

		return firstObject;
	}

	/**
	 * Transform the given room mapping.
	 * This method gives the canvas source the opportunity to improve
	 * or simply transform any room mapping.
	 * For example for DXF when the room mapping points to a already painted polyline that
	 * features bulges, the display is improved by returning the proper vertices that include
	 * the bulges.
	 *
	 * @param mapping to transform.
	 * @param scene of the canvas
	 * @param camera of the canvas
	 */
	public mapToRoom(mapping: RoomMapping, scene: Scene, camera: Camera): BufferGeometry {
		if (!!mapping.mappingVertex) {
			const object: Object3D | null = this.mapVertexToObject(mapping.mappingVertex.x, mapping.mappingVertex.y, camera);

			if (!!object) {
				const shape: Shape = this.possibleRoomObjectsShapes.get(object.uuid);
				if (!!shape) {
					return new ShapeBufferGeometry(shape);
				}
			}
		} else if (!!mapping.vertices) {
			const vertices: DxfPosition[] = mapping.vertices;

			const object: Object3D | null = this.mapVerticesToObject(vertices, camera);

			if (!!object) {
				const shape: Shape = this.possibleRoomObjectsShapes.get(object.uuid);
				if (!!shape) {
					return new ShapeBufferGeometry(shape);
				}
			}

			// Calculate hash code for the vertices
			const hashCode: number = DxfCanvasSource.calculateVerticesHashCode(vertices);

			// Check if we have something to transform in the current mapping
			const entry: RoomMappingTransformEntry = this.roomMappingVerticesToTransform.get(hashCode);
			if (!!entry) {
				return entry.transformed;
			}

			const shape: Shape = new Shape();
			for (let i = 0; i < mapping.vertices.length; i++) {
				const vertex: Vertex = mapping.vertices[i];

				if (i == 0) {
					shape.moveTo(vertex.x, vertex.y);
				} else {
					shape.lineTo(vertex.x, vertex.y);
				}
			}

			return new ShapeBufferGeometry(shape);
		}
	}

	/**
	 * Add vertices that should be transformed later for room mappings.
	 * See method transformRoomMapping.
	 * @param vertices to transform later
	 * @param transformed the transformed vertices
	 */
	public addVerticesToTransformForRoomMappings(vertices: DxfPosition[], transformed: BufferGeometry) {
		this.roomMappingVerticesToTransform.set(
			DxfCanvasSource.calculateVerticesHashCode(vertices),
			{
				vertices,
				transformed
			}
		);
	}

	/**
	 * Calculate a hash code for the given vertices.
	 * @param vertices to calculate hash code for
	 */
	private static calculateVerticesHashCode(vertices: DxfPosition[]): number {
		let hashCode: number = 1;

		for (const vertex of vertices) {
			hashCode = 31 * hashCode + DxfCanvasSource.calculateVertexHashCode(vertex);
		}

		return Math.round(hashCode);
	}

	/**
	 * Calculate a hash code for the passed vertex.
	 * @param vertex to calculate hash code for
	 */
	private static calculateVertexHashCode(vertex: DxfPosition): number {
		let result: number = vertex.x;
		result = 31 * result + vertex.y;
		result = 31 * result + (vertex.z ?? 0);

		return Math.round(result);
	}

	/**
	 * Check whether the two passed vertex lists are equal.
	 * @param v1 first vertex list
	 * @param v2 second vertex list
	 */
	private static equalsVertices(v1: DxfPosition[], v2: DxfPosition[]): boolean {
		if (v1.length !== v2.length) {
			return false;
		}

		for (let i = 0; i < v1.length; i++) {
			const vertex1: DxfPosition = v1[i];
			const vertex2: DxfPosition = v2[i];

			if (!DxfCanvasSource.equalsVertex(vertex1, vertex2)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check whether the two passed vertices are equal.
	 * @param v1 first vertex
	 * @param v2 second vertex
	 */
	private static equalsVertex(v1: DxfPosition, v2: DxfPosition): boolean {
		return v1.x === v2.x
			&& v1.y === v2.y
			&& v1.z === v2.z;
	}

	/**
	 * Draw the passed entity.
	 * @param entity to draw
	 * @param scene to draw onto
	 */
	private drawEntity(entity: DxfEntity, scene: Scene): void {
		const type: string = entity.type;

		const handler: EntityHandler = EntityHandlers.getHandler(type);
		if (!handler) {
			throw new Error(`Entity type '${type}' is not supported`);
		}

		const object: Object3D = handler.process(entity, this.dxf, this);
		scene.add(object);

		this.updateBounds(object);
	}

	/**
	 * Reset the bounds.
	 */
	private resetBounds(): void {
		this.bounds = {
			x: {min: null, max: null},
			y: {min: null, max: null},
			z: {min: null, max: null},
		};
	}

	/**
	 * Add a room object the user is able to map to.
	 * @param roomObject that is mappable to
	 * @param shape of the object
	 */
	public addMappingRoom(roomObject: Object3D, shape: Shape): void {
		this.possibleRoomObjects.push(roomObject);
		this.possibleRoomObjectsShapes.set(roomObject.uuid, shape);
	}

	/**
	 * Update the current bounds.
	 * @param object of a drawn object
	 */
	private updateBounds(object: Object3D) {
		const bounds: Box3 = new Box3().setFromObject(object);

		if (bounds.min.x !== undefined && bounds.min.x !== null) {
			if (!this.bounds.x.min || this.bounds.x.min > bounds.min.x) {
				this.bounds.x.min = bounds.min.x;
			}
		}
		if (bounds.max.x !== undefined && bounds.max.x !== null) {
			if (!this.bounds.x.max || this.bounds.x.max < bounds.max.x) {
				this.bounds.x.max = bounds.max.x;
			}
		}

		if (bounds.min.y !== undefined && bounds.min.y !== null) {
			if (!this.bounds.y.min || this.bounds.y.min > bounds.min.y) {
				this.bounds.y.min = bounds.min.y;
			}
		}
		if (bounds.max.y !== undefined && bounds.max.y !== null) {
			if (!this.bounds.y.max || this.bounds.y.max < bounds.max.y) {
				this.bounds.y.max = bounds.max.y;
			}
		}

		if (bounds.min.z !== undefined && bounds.min.z !== null) {
			if (!this.bounds.z.min || this.bounds.z.min > bounds.min.z) {
				this.bounds.z.min = bounds.min.z;
			}
		}
		if (bounds.max.z !== undefined && bounds.max.z !== null) {
			if (!this.bounds.z.max || this.bounds.z.max < bounds.max.z) {
				this.bounds.z.max = bounds.max.z;
			}
		}
	}

}

/**
 * Entry to transform later for room mappings.
 */
interface RoomMappingTransformEntry {

	/**
	 * The vertices of the room mapping.
	 */
	vertices: DxfPosition[];

	/**
	 * The transformed vertices.
	 */
	transformed: BufferGeometry;

}
