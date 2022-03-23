import {CanvasSourceReader} from "../canvas-source-reader";
import {CanvasSource} from "../canvas-source";
import {DxfCanvasSource} from "./dxf-canvas-source";
import {Dxf, DxfBlock, Helper} from "dxf";
import {CADFile} from "../../../../service/cad/cad-file";
import {BinaryUtil} from "../../../../util/binary-util";

/**
 * Reader for canvas sources from DXF files.
 */
export class DxfCanvasSourceReader implements CanvasSourceReader {

	/**
	 * Read the passed file in DXF format.
	 * @param file to read
	 */
	public async read(file: CADFile): Promise<CanvasSource> {
		const bytes: Uint8Array = BinaryUtil.decodeBase64(file.data);
		const contents: string = new TextDecoder(file.charsetName).decode(bytes);

		const helper: Helper = new Helper(contents);

		const dxf: Dxf = helper.parsed as Dxf;

		// Create a lookup map for blocks by their name
		dxf.blocksByName = new Map<string, DxfBlock>();
		for (const block of dxf.blocks) {
			dxf.blocksByName.set(block.name, block);
		}

		return new DxfCanvasSource(helper.parsed as Dxf);
	}

}
