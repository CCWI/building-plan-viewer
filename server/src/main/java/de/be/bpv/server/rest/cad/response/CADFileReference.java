package de.be.bpv.server.rest.cad.response;

import de.be.bpv.server.persistence.cad.CADFile;

import java.util.Date;

/**
 * Reference to a CAD file.
 */
public class CADFileReference {

    /**
     * Name of the CAD file.
     */
    private String name;

    /**
     * ID of the CAD file to later retrieve it.
     */
    private long id;

    /**
     * Timestamp of when the CAD file was created.
     */
    private Date createdTimestamp;

    public CADFileReference() {
        // Default constructor for Jackson
    }

    /**
     * Create a reference to the passed CAD file.
     *
     * @param from the file to create the reference from
     */
    public CADFileReference(CADFile from) {
        this.id = from.getId();
        this.name = from.getName();
        this.createdTimestamp = from.getCreatedTimestamp();
    }

    /**
     * Get the name of the CAD file.
     *
     * @return name
     */
    public String getName() {
        return name;
    }

    /**
     * Set the name of the CAD file.
     *
     * @param name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Get the ID of the CAD file.
     *
     * @return ID
     */
    public long getId() {
        return id;
    }

    /**
     * Set the ID of the CAD file.
     *
     * @param id to set
     */
    public void setId(long id) {
        this.id = id;
    }

    /**
     * Get the timestamp of when the CAD file was created.
     *
     * @return timestamp
     */
    public Date getCreatedTimestamp() {
        return createdTimestamp;
    }

    /**
     * Set the timestamp of when the CAD file was created.
     *
     * @param createdTimestamp to set
     */
    public void setCreatedTimestamp(Date createdTimestamp) {
        this.createdTimestamp = createdTimestamp;
    }

}
