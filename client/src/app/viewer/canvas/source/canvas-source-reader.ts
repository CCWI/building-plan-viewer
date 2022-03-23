import {CanvasSource} from "./canvas-source";
import {CADFile} from "../../../service/cad/cad-file";

/**
 * Reader for a canvas source.
 */
export interface CanvasSourceReader {

	/**
	 * Read a canvas source from the passed file.
	 * @param file to read canvas source from
	 */
	read(file: CADFile): Promise<CanvasSource>;

}
