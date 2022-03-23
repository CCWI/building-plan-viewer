package de.be.bpv.server.persistence.roommapping;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import de.be.bpv.server.persistence.roommapping.vertex.RoomMappingVertex;
import org.springframework.lang.Nullable;

import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.util.List;

/**
 * Representation of a mapping of a room.
 */
@Entity
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomMapping {

    /**
     * ID of the mapping.
     */
    @Id
    @Column(unique = true, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    /**
     * Name of the room to map.
     */
    @Column(nullable = false)
    private String roomName;

    /**
     * Category of the room this mapping maps to.
     */
    private int category;

    /**
     * Description of the room to map.
     */
    @Column(length = 5000, nullable = true)
    private String description;

    /**
     * Collection this mapping belongs to.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "collection_id", nullable = false)
    @JsonIgnore
    private RoomMappingCollection collection;

    /**
     * Vertex to try to map a specific shape to in the CAD file.
     */
    @Embedded
    @Column(nullable = true)
    private RoomMappingVertex mappingVertex;

    /**
     * Vertices of the room to map.
     */
    @ElementCollection
    @Column(nullable = true)
    private List<RoomMappingVertex> vertices;

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
     * Get the room name of the mapping.
     *
     * @return room name
     */
    public String getRoomName() {
        return roomName;
    }

    /**
     * Set the room name of the mapping.
     *
     * @param roomName to set
     */
    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    /**
     * Get the category this mapping assigns to the room.
     *
     * @return category
     */
    public int getCategory() {
        return category;
    }

    /**
     * Set the category of the room this mapping points to.
     *
     * @param category to set
     */
    public void setCategory(int category) {
        this.category = category;
    }

    /**
     * Get the description of the room.
     *
     * @return description
     */
    @Nullable
    public String getDescription() {
        return description;
    }

    /**
     * Set the description of the room.
     *
     * @param description to set
     */
    public void setDescription(@Nullable String description) {
        this.description = description;
    }

    /**
     * Get the vertex that maps to a room shape.
     *
     * @return vertex
     */
    @Nullable
    public RoomMappingVertex getMappingVertex() {
        return mappingVertex;
    }

    /**
     * Set the vertex that maps to a room shape.
     *
     * @param mappingVertex to set
     */
    public void setMappingVertex(@Nullable RoomMappingVertex mappingVertex) {
        this.mappingVertex = mappingVertex;
    }

    /**
     * Get the vertices of the room to map to.
     *
     * @return vertices
     */
    @Nullable
    public List<RoomMappingVertex> getVertices() {
        return vertices;
    }

    /**
     * Set the vertices of the room to map to.
     *
     * @param vertices to set
     */
    public void setVertices(@Nullable List<RoomMappingVertex> vertices) {
        this.vertices = vertices;
    }

    /**
     * Get the room mapping collection this belongs to.
     *
     * @return room mapping collection
     */
    public RoomMappingCollection getCollection() {
        return collection;
    }

    /**
     * Set the room mapping collection this belongs to.
     *
     * @param collection to set
     */
    public void setCollection(RoomMappingCollection collection) {
        this.collection = collection;
    }

}
