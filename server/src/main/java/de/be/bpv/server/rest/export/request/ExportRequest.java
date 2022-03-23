package de.be.bpv.server.rest.export.request;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Request for exporting a CAD file and mapping.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExportRequest {

    /**
     * ID of the CAD file to export.
     */
    private Long cadFileId;

    /**
     * ID of the mapping to export.
     */
    private Long mappingId;

    /**
     * Name of the color map to use.
     */
    private String colorMap;

    public Long getCadFileId() {
        return cadFileId;
    }

    public void setCadFileId(Long cadFileId) {
        this.cadFileId = cadFileId;
    }

    public Long getMappingId() {
        return mappingId;
    }

    public void setMappingId(Long mappingId) {
        this.mappingId = mappingId;
    }

    public String getColorMap() {
        return colorMap;
    }

    public void setColorMap(String colorMap) {
        this.colorMap = colorMap;
    }

}
