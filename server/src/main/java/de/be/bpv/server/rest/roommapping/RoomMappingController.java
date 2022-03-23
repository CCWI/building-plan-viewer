package de.be.bpv.server.rest.roommapping;

import de.be.bpv.server.persistence.roommapping.RoomMapping;
import de.be.bpv.server.persistence.roommapping.RoomMappingCollection;
import de.be.bpv.server.persistence.roommapping.RoomMappingRepository;
import de.be.bpv.server.rest.roommapping.response.RoomMappingReference;
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
 * REST controller for room mappings.
 */
@RestController
@RequestMapping("/api/room-mapping")
public class RoomMappingController {

    /**
     * Repository managing room mapping entities.
     */
    private final RoomMappingRepository roomMappingRepository;

    public RoomMappingController(RoomMappingRepository roomMappingRepository) {
        this.roomMappingRepository = roomMappingRepository;
    }

    /**
     * Get references to all available room mappings.
     *
     * @return reference to all available room mappings
     */
    @GetMapping
    public ResponseEntity<Iterable<RoomMappingReference>> getAll() {
        List<RoomMappingReference> references = new ArrayList<>();
        for (RoomMappingCollection mapping : roomMappingRepository.findAll()) {
            references.add(new RoomMappingReference(mapping));
        }

        return ResponseEntity.ok(references);
    }

    /**
     * Get all mapping for the passed CAD file ID.
     *
     * @param cadFileId to get mapping for
     * @return references to mappings for the passed CAD file ID
     */
    @GetMapping("/for/{cadFileId}")
    public ResponseEntity<Iterable<RoomMappingReference>> getForCADFileID(@PathVariable long cadFileId) {
        List<RoomMappingReference> references = new ArrayList<>();
        for (RoomMappingCollection mapping : roomMappingRepository.findAllByCadFileID(cadFileId)) {
            references.add(new RoomMappingReference(mapping));
        }

        return ResponseEntity.ok(references);
    }

    /**
     * Get a mapping by its ID.
     *
     * @param id to get mapping for
     * @return the requested mapping
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoomMappingCollection> getByID(@PathVariable long id) {
        return roomMappingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new mapping.
     *
     * @param mapping to create
     * @return the reference of the created mapping
     */
    @PostMapping
    public ResponseEntity<RoomMappingReference> create(@RequestBody RoomMappingCollection mapping) {
        for (RoomMapping m : mapping.getMappings()) {
            m.setCollection(mapping);
        }

        mapping = roomMappingRepository.save(mapping);

        return ResponseEntity.created(
                ServletUriComponentsBuilder.fromCurrentRequest()
                        .path("/{id}")
                        .buildAndExpand(mapping.getId())
                        .toUri())
                .body(new RoomMappingReference(mapping));
    }

    /**
     * Update the mapping with the same ID as in the provided mapping instance.
     *
     * @param mapping to update
     * @return a reference to the updated mapping
     */
    @PutMapping
    public ResponseEntity<RoomMappingReference> update(@RequestBody RoomMappingCollection mapping) {
        return roomMappingRepository.findById(mapping.getId()).map(existingMapping -> {
            existingMapping.setName(mapping.getName());
            existingMapping.setCadFileID(mapping.getCadFileID());
            existingMapping.setMappings(mapping.getMappings());

            return ResponseEntity.ok(new RoomMappingReference(existingMapping));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete the mapping with the passed ID.
     *
     * @param id to delete mapping for
     * @return a reference to the deleted mapping
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<RoomMappingReference> delete(@PathVariable long id) {
        return roomMappingRepository.findById(id).map(mapping -> {
            RoomMappingReference reference = new RoomMappingReference(mapping);
            roomMappingRepository.delete(mapping);

            return ResponseEntity.ok(reference);
        }).orElse(ResponseEntity.notFound().build());
    }

}
