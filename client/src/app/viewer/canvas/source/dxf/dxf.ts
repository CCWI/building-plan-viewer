/**
 * Parsed DXF object representation.
 */
export interface Dxf {

	/**
	 * Available blocks.
	 */
	blocks: DxfBlock[];

	/**
	 * Available entities.
	 */
	entities: DxfEntity[];

	/**
	 * Header of the DXF format.
	 */
	header: DxfHeader;

	/**
	 * Tables of the DXF format.
	 */
	tables: DxfTables;

	/**
	 * Lookup of blocks by their name.
	 */
	blocksByName?: Map<string, DxfBlock>;

}

/**
 * Tables of the DXF format.
 */
export interface DxfTables {

	/**
	 * Layers in the DXF.
	 */
	layers: any; // Map of string to DxfLayer

	/**
	 * Styles in the DXF.
	 */
	styles: any; // Map of string to DxfStyle

}

/**
 * Style of a DXF.
 */
export interface DxfStyle {

	/**
	 * Name of the style.
	 */
	name: string;

	bigFontFileName: string;

	/**
	 * Fixed text height.
	 */
	fixedTextHeight: number;

	/**
	 * Flags.
	 */
	flags: number;

	lastHeightUsed: number;

	obliqueAngle: number;

	primaryFontFileName: string;

	widthFactor: number;

}

/**
 * Layer of a DXF.
 */
export interface DxfLayer {

	/**
	 * Color number.
	 */
	colorNumber: number;

	/**
	 * Flags.
	 */
	flags: number;

	/**
	 * Name of the line type.
	 */
	lineTypeName: string;

	/**
	 * Enum of the line weight.
	 */
	lineWeightEnum: string;

	/**
	 * Name of the layer.
	 */
	name: string;

	/**
	 * Type of the layer.
	 */
	type: string;

}

/**
 * Header of the DXF format.
 */
export interface DxfHeader {

	extMax: DxfPosition;
	extMin: DxfPosition;
	insUnits: number;
	measurement: number;

}

/**
 * Polyline entity.
 */
export interface DxfPolylineEntity extends DxfEntity {

	/**
	 * Vertices of the entity.
	 */
	vertices: DxfPolylineVertex[];

	/**
	 * Whether the polyline is closed.
	 */
	closed: boolean;

	/**
	 * Thickness of the line.
	 */
	thickness?: number;

}

/**
 * Polyline entity.
 */
export interface PolylineEntity extends DxfLWPolylineEntity {

	polyfaceMesh: boolean;
	polygonMesh: boolean;

}

/**
 * LWPolyline (lightweight polyline) entity.
 */
export interface DxfLWPolylineEntity extends DxfEntity {

	/**
	 * Vertices of the entity.
	 */
	vertices: DxfPolylineVertex[];

	/**
	 * Whether the line is closed.
	 */
	closed: boolean;

	/**
	 * Thickness of the line.
	 */
	thickness?: number;

}

/**
 * Vertex of polyline entities.
 */
export interface DxfPolylineVertex extends DxfPosition {

	bulge: number;

}

/**
 * A MText Entity.
 */
export interface DxfMTextEntity extends DxfEntity, DxfPosition {

	/**
	 * Text in the entity.
	 */
	string: string;

	/**
	 * Description of the text style (font family, ...).
	 */
	styleName: string;

	/**
	 * Rectangle width.
	 */
	refRectangleWidth: number;

	/**
	 * Nominal text height.
	 */
	nominalTextHeight: number;

	/**
	 * The drawing direction of the text.
	 */
	drawingDirection: number;

	/**
	 * Attachment point of the text.
	 */
	attachmentPoint: number;

	/**
	 * Rotation around X-Axis.
	 */
	xAxisX?: number;

	/**
	 * Rotation around Y-Axis.
	 */
	xAxisY?: number;

}

/**
 * A Circle entity.
 */
export interface DxfCircleEntity extends DxfEntity, DxfPosition {

	/**
	 * Radius of the circle.
	 */
	r: number;

}

/**
 * An Arc entity.
 */
export interface DxfArcEntity extends DxfEntity, DxfPosition {

	/**
	 * Start angle of the arc.
	 */
	startAngle: number;

	/**
	 * End angle of the arc.
	 */
	endAngle: number;

	/**
	 * Radius of the arc.
	 */
	r: number;

	/**
	 * Name of the arcs line type.
	 */
	lineTypeName: string;

	/**
	 * Thickness of the arc line.
	 */
	thickness?: number;

}

/**
 * A Line entity.
 */
export interface DxfLineEntity extends DxfEntity {

	/**
	 * Start of the line.
	 */
	start: DxfPosition;

	/**
	 * End of the line.
	 */
	end: DxfPosition;

	/**
	 * Thickness of the line.
	 */
	thickness?: number;

}

/**
 * A Insert entity.
 */
export interface DxfInsertEntity extends DxfEntity, DxfPosition {

	/**
	 * Name of the block the entity belongs to.
	 */
	block: string;

}

/**
 * A Spline entity.
 */
export interface DxfSplineEntity extends DxfEntity, DxfPosition {

	/**
	 * Control points of the spline.
	 */
	controlPoints: DxfPosition[];

	/**
	 * Knots.
	 */
	knots: number[];

	/**
	 * Knot tolerance.
	 */
	knotTolerance: number;

	/**
	 * Control point tolerance.
	 */
	controlPointTolerance: number;

	/**
	 * Fit tolerance.
	 */
	fitTolerance: number;

	/**
	 * Spline flags:
	 * 1: closed spline
	 * 2: periodic spline
	 * 4: rational spline
	 * 8: planar spline
	 * 16: linear spline
	 */
	flag: number;

	/**
	 * Whether the spline is closed.
	 */
	closed: boolean;

	/**
	 * Spline degree.
	 */
	degree: number;

	/**
	 * Amount of knots.
	 */
	numberOfKnots: number;

	/**
	 * Amount of control points.
	 */
	numberOfControlPoints: number;

	/**
	 * Amount of fit points.
	 */
	numberOfFitPoints: number;

}

/**
 * A Point entity.
 */
export interface DxfPointEntity extends DxfEntity, DxfPosition {

	/**
	 * Thickness of the point.
	 */
	thickness?: number;

}

/**
 * A Solid entity.
 */
export interface DxfSolidEntity extends DxfEntity {

	/**
	 * Corners of the solid.
	 */
	corners: DxfPosition[];

	/**
	 * Thickness of the solid.
	 */
	thickness?: number;

}

/**
 * An Ellipse entity.
 */
export interface DxfEllipseEntity extends DxfEntity, DxfPosition {

	majorX: number;
	majorY: number;
	majorZ: number;

	axisRatio: number;

	startAngle: number;
	endAngle: number;

}

/**
 * An 3DFace entity.
 */
export interface Dxf3DFaceEntity extends DxfEntity {

	/**
	 * Vertices of the entity.
	 */
	vertices: DxfPosition[];

}

/**
 * Block of the DXF object.
 */
export interface DxfBlock extends DxfPosition {

	/**
	 * Name of the block.
	 */
	name: string;

	/**
	 * X-ref.
	 */
	xref: string;

	/**
	 * Entities in the block.
	 */
	entities: DxfEntity[];

}

/**
 * Entity of the DXF object.
 */
export interface DxfEntity {

	/**
	 * Number of the color.
	 */
	colorNumber: number;

	/**
	 * Start position.
	 */
	start: DxfPosition;

	/**
	 * End position.
	 */
	end: DxfPosition;

	/**
	 * Name of the layer.
	 */
	layer: string;

	/**
	 * Line type name.
	 */
	lineTypeName: string;

	/**
	 * Type of the entity.
	 */
	type: string;

}

/**
 * Position in a DXF object.
 */
export interface DxfPosition {

	/**
	 * X-coordinate.
	 */
	x: number;

	/**
	 * Y-coordinate.
	 */
	y: number;

	/**
	 * Z-coordinate.
	 */
	z: number;

}
