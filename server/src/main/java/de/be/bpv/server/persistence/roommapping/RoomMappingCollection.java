package de.be.bpv.server.persistence.roommapping;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import java.util.Date;
import java.util.List;

/**
 * Collection of room mappings.
 */
@Entity
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomMappingCollection {

    /**
     * ID of the mapping.
     */
    @Id
    @Column(unique = true, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    /**
     * Name of the room mapping.
     */
    @Column(nullable = false)
    private String name;

    /**
     * Timestamp of when the mapping was created.
     */
    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private Date createdTimestamp;

    /**
     * ID of the CAD file this mapping belongs to.
     */
    @Column(nullable = false)
    private Long cadFileID;

    /**
     * List of room mappings in the collection.
     */
    @OneToMany(
            mappedBy = "collection",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL
    )
    private List<RoomMapping> mappings;

    /**
     * Get the ID of the mapping.
     *
     * @return ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Set the ID of the mapping.
     *
     * @param id to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Get the name of the mapping.
     *
     * @return name
     */
    public String getName() {
        return name;
    }

    /**
     * Set the name of the mapping.
     *
     * @param name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Get the created timestamp.
     *
     * @return created timestamp
     */
    public Date getCreatedTimestamp() {
        return createdTimestamp;
    }

    /**
     * Set the created timestamp.
     *
     * @param createdTimestamp to set
     */
    public void setCreatedTimestamp(Date createdTimestamp) {
        this.createdTimestamp = createdTimestamp;
    }

    /**
     * Get the ID of the CAD file this mapping belongs to.
     *
     * @return ID of the CAD file
     */
    public Long getCadFileID() {
        return cadFileID;
    }

    /**
     * Set the ID of the CAD file this mapping belongs to.
     *
     * @param cadFileID to set
     */
    public void setCadFileID(Long cadFileID) {
        this.cadFileID = cadFileID;
    }

    /**
     * Get the room mappings in the collection.
     *
     * @return room mappings
     */
    public List<RoomMapping> getMappings() {
        return mappings;
    }

    /**
     * Set the room mappings in the collection.
     *
     * @param mappings to set
     */
    public void setMappings(List<RoomMapping> mappings) {
        this.mappings = mappings;
    }

}
