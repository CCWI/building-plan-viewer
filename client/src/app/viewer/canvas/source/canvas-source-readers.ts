import {CanvasSourceReader} from "./canvas-source-reader";
import {DxfCanvasSourceReader} from "./dxf/dxf-canvas-source-reader";

/**
 * Collection of available canvas source readers.
 */
export class CanvasSourceReaders {

	/**
	 * Map holding available readers by the file endings of the files the readers can read.
	 */
	private static readonly READERS = new Map<string, CanvasSourceReader>([
		["dxf", new DxfCanvasSourceReader()],
	]);

	/**
	 * A list of supported file endings.
	 */
	private static SUPPORTED_FILE_ENDINGS: Set<string>;

	/**
	 * Get a reader for the passed CAD file type
	 * @param type to get reader for
	 */
	public static getReader(type: string): CanvasSourceReader | null {
		return this.READERS.get(type.toLowerCase());
	}

	/**
	 * Get a list of supported file endings.
	 */
	public static getSupportedFileEndings(): Set<string> {
		if (!!CanvasSourceReaders.SUPPORTED_FILE_ENDINGS) {
			return CanvasSourceReaders.SUPPORTED_FILE_ENDINGS;
		}

		CanvasSourceReaders.SUPPORTED_FILE_ENDINGS = new Set<string>();
		for (const key of CanvasSourceReaders.READERS.keys()) {
			CanvasSourceReaders.SUPPORTED_FILE_ENDINGS.add(key);
		}

		return CanvasSourceReaders.SUPPORTED_FILE_ENDINGS;
	}

}
