package de.be.bpv.server.persistence.roommapping;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Spring data repository for room mapping collection entities.
 */
public interface RoomMappingRepository extends CrudRepository<RoomMappingCollection, Long> {

    /**
     * Get all mappings by the passed CAD file ID.
     *
     * @param cadFileID to get mappings for
     * @return all mappings for the CAD file
     */
    List<RoomMappingCollection> findAllByCadFileID(long cadFileID);

}
