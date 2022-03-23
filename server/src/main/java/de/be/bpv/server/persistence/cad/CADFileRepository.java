package de.be.bpv.server.persistence.cad;

import org.springframework.data.repository.CrudRepository;

/**
 * CAD file repository for spring data.
 */
public interface CADFileRepository extends CrudRepository<CADFile, Long> {
}
