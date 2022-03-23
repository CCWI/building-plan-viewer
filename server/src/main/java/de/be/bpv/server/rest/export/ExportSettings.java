package de.be.bpv.server.rest.export;

import com.fasterxml.jackson.annotation.JsonInclude;
import de.be.bpv.server.persistence.cad.CADFile;
import de.be.bpv.server.persistence.roommapping.RoomMappingCollection;

/**
 * Export settings written to the exported HTML file as JSON.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExportSettings {

    /**
     * Exported CAD file.
     */
    private CADFile cadFile;

    /**
     * Exported room mapping collection.
     */
    private RoomMappingCollection roomMappingCollection;

    /**
     * Name of the color map to use.
     */
    private String colorMap;

    public CADFile getCadFile() {
        return cadFile;
    }

    public void setCadFile(CADFile cadFile) {
        this.cadFile = cadFile;
    }

    public RoomMappingCollection getRoomMappingCollection() {
        return roomMappingCollection;
    }

    public void setRoomMappingCollection(RoomMappingCollection roomMappingCollection) {
        this.roomMappingCollection = roomMappingCollection;
    }

    public String getColorMap() {
        return colorMap;
    }

    public void setColorMap(String colorMap) {
        this.colorMap = colorMap;
    }

}
