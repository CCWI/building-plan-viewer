package de.be.bpv.server.rest.cad;

import de.be.bpv.server.persistence.cad.CADFile;
import de.be.bpv.server.persistence.cad.CADFileRepository;
import de.be.bpv.server.rest.cad.response.CADFileReference;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

/**
 * REST controller for CAD files.
 */
@RestController
@RequestMapping("/api/cad")
public class CADFileController {

    /**
     * Repository managing CAD files.
     */
    private final CADFileRepository cadFileRepository;

    public CADFileController(CADFileRepository cadFileRepository) {
        this.cadFileRepository = cadFileRepository;
    }

    /**
     * Get references to all available CAD files.
     *
     * @return reference to all available CAD files
     */
    @GetMapping
    public ResponseEntity<Iterable<CADFileReference>> getAll() {
        List<CADFileReference> references = new ArrayList<>();
        for (CADFile file : cadFileRepository.findAll()) {
            references.add(new CADFileReference(file));
        }

        return ResponseEntity.ok(references);
    }

    /**
     * Get a CAD file by its ID.
     *
     * @param id to get file for
     * @return the requested CAD file
     */
    @GetMapping("/{id}")
    public ResponseEntity<CADFile> getByID(@PathVariable long id) {
        return cadFileRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new CAD file.
     *
     * @param cadFile to create
     * @return the ID of the file created
     */
    @PostMapping
    public ResponseEntity<CADFileReference> create(@RequestBody CADFile cadFile) {
        cadFile = cadFileRepository.save(cadFile);

        return ResponseEntity.created(
                ServletUriComponentsBuilder.fromCurrentRequest()
                        .path("/{id}")
                        .buildAndExpand(cadFile.getId())
                        .toUri())
                .body(new CADFileReference(cadFile));
    }

    /**
     * Update the CAD file with the same ID as in the provided CAD file instance.
     *
     * @param cadFile to update
     * @return a reference to the updated CAD file
     */
    @PutMapping
    public ResponseEntity<CADFileReference> update(@RequestBody CADFile cadFile) {
        return cadFileRepository.findById(cadFile.getId()).map(existingCADFile -> {
            existingCADFile.setName(cadFile.getName());
            existingCADFile.setType(cadFile.getType());
            existingCADFile.setData(cadFile.getData());
            existingCADFile.setCharsetName(cadFile.getCharsetName());

            return ResponseEntity.ok(new CADFileReference(existingCADFile));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete the CAD file with the passed ID.
     *
     * @param id to delete CAD file for
     * @return a reference to the deleted CAD file
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<CADFileReference> delete(@PathVariable long id) {
        return cadFileRepository.findById(id).map(cadFile -> {
            CADFileReference reference = new CADFileReference(cadFile);
            cadFileRepository.delete(cadFile);

            return ResponseEntity.ok(reference);
        }).orElse(ResponseEntity.notFound().build());
    }

}
