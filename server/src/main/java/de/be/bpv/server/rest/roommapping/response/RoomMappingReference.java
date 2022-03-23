package de.be.bpv.server.rest.roommapping.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import de.be.bpv.server.persistence.roommapping.RoomMappingCollection;
import org.springframework.lang.Nullable;

import java.util.Date;

/**
 * Reference to a room mapping.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomMappingReference {

    /**
     * ID fo the mapping.
     */
    private long id;

    /**
     * Name of the mapping.
     */
    @Nullable
    private String name;

    /**
     * Timestamp of the mapping creation.
     */
    private Date createdTimestamp;

    public RoomMappingReference() {
        // Default constructor for Jackson.
    }

    /**
     * Create a reference for the passed mapping.
     *
     * @param mapping to create reference for
     */
    public RoomMappingReference(RoomMappingCollection mapping) {
        this.id = mapping.getId();
        this.name = mapping.getName();
        this.createdTimestamp = mapping.getCreatedTimestamp();
    }

    /**
     * Get the ID of the mapping.
     *
     * @return ID
     */
    public long getId() {
        return id;
    }

    /**
     * Set the ID of the mapping.
     *
     * @param id to set
     */
    public void setId(long id) {
        this.id = id;
    }

    /**
     * Get the name of the mapping.
     *
     * @return name
     */
    @Nullable
    public String getName() {
        return name;
    }

    /**
     * Set the name of the mapping.
     *
     * @param name to set
     */
    public void setName(@Nullable String name) {
        this.name = name;
    }

    /**
     * Get the timestamp of when the mapping was created.
     *
     * @return timestamp
     */
    public Date getCreatedTimestamp() {
        return createdTimestamp;
    }

    /**
     * Set the timestamp of when the mapping was created.
     *
     * @param createdTimestamp to set
     */
    public void setCreatedTimestamp(Date createdTimestamp) {
        this.createdTimestamp = createdTimestamp;
    }

}
