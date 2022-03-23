import * as DXF from "dxf";
import * as dxf2svg from "dxf2svg";
import * as dxftoobject from "dxftoobject";

declare var DxfParser: any;

/**
 * Performance test for the different DXF loader libraries.
 */
export class PerformanceTest {

	public static readFile(file: File): void {
		const reader: FileReader = new FileReader();
		reader.onload = async (e) => {
			const dxfContentStr: string | ArrayBuffer = e.target.result;

			console.log("dxf:");
			let timer = window.performance.now();
			const helper = new DXF.Helper(dxfContentStr);
			console.log(helper.parsed);
			console.log(`dxf took ${window.performance.now() - timer}ms`);

			console.log("dxf2svg:");
			timer = window.performance.now();
			console.log(dxf2svg.parseString(dxfContentStr));
			console.log(`dxf2svg took ${window.performance.now() - timer}ms`);

			console.log("dxf2object:");
			timer = window.performance.now();
			await dxftoobject.default(dxfContentStr).then(result => console.log(result));
			console.log(`dxf2object took ${window.performance.now() - timer}ms`);

			console.log("dxf-parser:");
			timer = window.performance.now();
			console.log(new DxfParser().parseSync(dxfContentStr));
			console.log(`dxf-parser took ${window.performance.now() - timer}ms`);
		};
		reader.readAsText(file);
	}

}
