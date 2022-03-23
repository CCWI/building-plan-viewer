package de.be.bpv.server.rest.export;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.be.bpv.server.persistence.cad.CADFile;
import de.be.bpv.server.persistence.cad.CADFileRepository;
import de.be.bpv.server.persistence.roommapping.RoomMappingCollection;
import de.be.bpv.server.persistence.roommapping.RoomMappingRepository;
import de.be.bpv.server.rest.export.request.ExportRequest;
import de.be.bpv.server.rest.export.ExportSchedulerService;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;


import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.stream.Collectors;

/**
 * REST controller for exporting.
 */
@RestController
@RequestMapping("/api/export")
public class ExportController {

    /**
     * Repository managing CAD files.
     */
    private final CADFileRepository cadFileRepository;

    /**
     * Repository managing room mappings.
     */
    private final RoomMappingRepository roomMappingRepository;

    /**
     * Object mapper to use.
     */
    private final ObjectMapper objectMapper;

    /**
     * Export Scheduler to use.
     */
    private ExportSchedulerService exportSchedulerService;

    /**
     * Environment Variable of Server IP
     */
    @Value("${viewer.server.link}")
    private String serverIP;

    /**
     * Environment Variable of Upload Folder
     */
    @Value("${upload.folder.path}")
    private String uploadFolder;

    /**
     * The base HTML for export resource.
     */
    @Value("classpath:static/export.html")
    Resource exportHTMLResource;

    public ExportController(
            CADFileRepository cadFileRepository,
            RoomMappingRepository roomMappingRepository,
            ObjectMapper objectMapper,
            ExportSchedulerService exportSchedulerService
    ) {
        this.cadFileRepository = cadFileRepository;
        this.roomMappingRepository = roomMappingRepository;
        this.objectMapper = objectMapper;
        this.exportSchedulerService = exportSchedulerService;
    }

    /**
     * Export the passed CAD file and mapping (optionally) as HTML.
     *
     * @param exportRequest to do export for
     * @return the exported HTML as string
     */
    @PostMapping("/html")
    public ResponseEntity<String> export(@RequestBody ExportRequest exportRequest) throws IOException {
        Document doc = getBaseExportHTMLDocument();

        CADFile cadFile = cadFileRepository.findById(exportRequest.getCadFileId()).orElse(null);
        if (cadFile == null) {
            return ResponseEntity.notFound().build();
        }

        RoomMappingCollection roomMappingCollection = exportRequest.getMappingId() != null
                ? roomMappingRepository.findById(exportRequest.getMappingId()).orElse(null)
                : null;

        // Build export settings
        ExportSettings exportSettings = new ExportSettings();
        exportSettings.setCadFile(cadFile);
        exportSettings.setRoomMappingCollection(roomMappingCollection);
        exportSettings.setColorMap(exportRequest.getColorMap());

        // Serialize export settings
        StringBuilder sb = new StringBuilder();
        sb.append("var app_isExportMode = true;");

        sb.append("var app_exportSettings = ");
        sb.append(objectMapper.writeValueAsString(exportSettings));
        sb.append(";");

        // Add export settings to export HTML
        Element headElement = doc.getElementsByTag("head").first();
        Element scriptElement = doc.createElement("script");
        scriptElement.appendText(sb.toString());
        headElement.insertChildren(0, scriptElement);

        return ResponseEntity.ok(doc.toString());
    }

    /**
     * Receive a Link to an Exported HTML-File.
     * @param exportRequest to do export for
     * @return the Link as string
     */
    @CrossOrigin(maxAge = 3600)
    @PostMapping("/getLink")
    public ResponseEntity<String> getLink(@RequestBody ExportRequest exportRequest) throws IOException {

        Document doc = getBaseExportHTMLDocument();

        CADFile cadFile = cadFileRepository.findById(exportRequest.getCadFileId()).orElse(null);
        if (cadFile == null) {
            return ResponseEntity.notFound().build();
        }

        RoomMappingCollection roomMappingCollection = exportRequest.getMappingId() != null
                ? roomMappingRepository.findById(exportRequest.getMappingId()).orElse(null)
                : null;

        // Build export settings
        ExportSettings exportSettings = new ExportSettings();
        exportSettings.setCadFile(cadFile);
        exportSettings.setRoomMappingCollection(roomMappingCollection);
        exportSettings.setColorMap(exportRequest.getColorMap());

        // Serialize export settings
        StringBuilder sb = new StringBuilder();
        sb.append("var app_isExportMode = true;");

        sb.append("var app_exportSettings = ");
        sb.append(objectMapper.writeValueAsString(exportSettings));
        sb.append(";");

        // Add export settings to export HTML
        Element headElement = doc.getElementsByTag("head").first();
        Element scriptElement = doc.createElement("script");
        scriptElement.appendText(sb.toString());
        headElement.insertChildren(0, scriptElement);

        //Get IDs from Export Request for file naming
        Long cadFileId = exportRequest.getCadFileId();
        Long mappingId = exportRequest.getMappingId();

        //Initialize Variables
        Calendar calendar = Calendar.getInstance();
        String returntext = "";
        File convFile;

        //Get timestamp for file naming
        SimpleDateFormat formatter = new SimpleDateFormat("ddMMyyyy-HHmmss");
        String timestamp = formatter.format(calendar.getTime());

        //Generate file path, file name and link to file
        if(mappingId == null){
            convFile = new File(uploadFolder + "/response_" + cadFileId + "_" + timestamp + ".html");
            returntext = serverIP +  "response_" + cadFileId.toString() + "_" + timestamp + ".html";
        }
        else {
            convFile = new File(uploadFolder + "/response_" + cadFileId + "_" + mappingId + "_" + timestamp + ".html");
            returntext = serverIP +"response_" + cadFileId.toString() + "_" + mappingId.toString() + "_" + timestamp + ".html";
        }

        //Write HTML Doc to file
        FileWriter fw = new FileWriter(convFile.getAbsoluteFile());
        BufferedWriter bw = new BufferedWriter(fw);
        bw.write(doc.toString().replace("Ro(\"ngIf\",e.showPlaceholder),", ""));
        bw.close();

        //Delete File after X minutes
        exportSchedulerService.scheduleForDeletion(convFile.toPath(), 15);

        return new ResponseEntity<>(returntext, HttpStatus.OK);
    }

    /**
     * Get the base export HTML document.
     *
     * @return base export HTML document
     * @throws IOException in case the HTML document could not be read
     */
    private Document getBaseExportHTMLDocument() throws IOException {
        // Read base HTML export file from resources
        String exportHTML = readExportHTML();

        // Parse export HTML in preparation of adding the CAD file and mapping
        return Jsoup.parse(exportHTML);
    }

    /**
     * Read the base export HTML from resources.
     *
     * @return base export HTML string
     * @throws IOException in case the HTML could not be read
     */
    private String readExportHTML() throws IOException {
        // Read base HTML export file from resources
        InputStream exportHTMLStream = exportHTMLResource.getInputStream();

        return new BufferedReader(new InputStreamReader(exportHTMLStream, StandardCharsets.UTF_8))
                .lines()
                .collect(Collectors.joining("\n"));
    }



}
