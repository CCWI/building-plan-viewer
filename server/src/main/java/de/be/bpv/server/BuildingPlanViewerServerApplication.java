package de.be.bpv.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class BuildingPlanViewerServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(BuildingPlanViewerServerApplication.class, args);

		// Delete all Files in html_export directory at startup (only for Windows not Docker)

		//File dir = new File("./server/html_exports");
		//for(File file: dir.listFiles())
		//	if (!file.isDirectory())
		//		file.delete();

	}

}
