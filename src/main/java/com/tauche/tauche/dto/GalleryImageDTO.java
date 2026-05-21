package com.tauche.tauche.dto;

import com.tauche.tauche.model.GalleryImage;

public class GalleryImageDTO {
    private Long id;
    private String imagePath;
    private String tags;
    private String createdAt;

    public static GalleryImageDTO fromEntity(GalleryImage image) {
        GalleryImageDTO dto = new GalleryImageDTO();
        dto.setId(image.getId());
        dto.setImagePath(image.getImagePath());
        dto.setTags(image.getTags());
        dto.setCreatedAt(image.getCreatedAt() != null ? image.getCreatedAt().toString() : null);
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}