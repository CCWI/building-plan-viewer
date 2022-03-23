package de.be.bpv.server.persistence.cad;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.lang.Nullable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import java.util.Date;

/**
 * Entity as representation for a CAD file.
 */
@Entity
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CADFile {

    /**
     * ID of the CAD file.
     */
    @Id
    @Column(unique = true, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    /**
     * Name of the CAD file.
     */
    @Column(length = 1000, nullable = false)
    private String name;

    /**
     * Type of the CAD file.
     */
    @Enumerated(EnumType.STRING)
    private CADFileType type;

    /**
     * The actual CAD file.
     */
    @Lob
    private byte[] data;

    /**
     * Name of the charset in which the data is encoded.
     * May be null if the data is not to be interpreted as Text.
     */
    @Column(nullable = true)
    private String charsetName;

    /**
     * Timestamp of when the mapping was created.
     */
    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private Date createdTimestamp;

    /**
     * Get the ID of the CAD file.
     *
     * @return ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Set the ID of the CAD file.
     *
     * @param id to set
     */
    public void setId(Long id) {
        this.id = id;
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
     * Get the type of the CAD file.
     *
     * @return type
     */
    public CADFileType getType() {
        return type;
    }

    /**
     * Set the type of the CAD file.
     *
     * @param type of the file
     */
    public void setType(CADFileType type) {
        this.type = type;
    }

    /**
     * Get the files data.
     *
     * @return data
     */
    public byte[] getData() {
        return data;
    }

    /**
     * Set the files data.
     *
     * @param data to set
     */
    public void setData(byte[] data) {
        this.data = data;
    }

    /**
     * Get the name of the charset to interpret the data binary with.
     * This may be null if the data is not to be interpreted as text.
     *
     * @return charset name
     */
    @Nullable
    public String getCharsetName() {
        return charsetName;
    }

    /**
     * Set the name of the charset to interpret the data binary with.
     *
     * @param charsetName to set
     */
    public void setCharsetName(@Nullable String charsetName) {
        this.charsetName = charsetName;
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

}
