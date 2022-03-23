package de.be.bpv.server.persistence.roommapping.vertex;

import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 * Vertex of a room mapping.
 */
@Embeddable
public class RoomMappingVertex {

    /**
     * X-coordinate of the vertex.
     */
    @Column(nullable = true)
    private double x;

    /**
     * Y-coordinate of the vertex.
     */
    @Column(nullable = true)
    private double y;

    /**
     * Get the X-coordinate of the vertex.
     *
     * @return X-coordinate
     */
    public double getX() {
        return x;
    }

    /**
     * Set the X-coordinate of the vertex.
     *
     * @param x coordinate to set
     */
    public void setX(double x) {
        this.x = x;
    }

    /**
     * Get the Y-coordinate of the vertex.
     *
     * @return Y-coordinate
     */
    public double getY() {
        return y;
    }

    /**
     * Set the Y-coordinate of the vertex.
     *
     * @param y coordinate to set
     */
    public void setY(double y) {
        this.y = y;
    }

}
