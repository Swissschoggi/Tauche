package com.tauche.tauche.dto;

import com.tauche.tauche.model.Equipment;

public class SimpleEquipmentDTO {
    private Long id;
    private String name;
    private String category;
    private String serialNumber;

    public SimpleEquipmentDTO() {}

    public static SimpleEquipmentDTO fromEntity(Equipment equipment) {
        SimpleEquipmentDTO dto = new SimpleEquipmentDTO();
        dto.setId(equipment.getId());
        dto.setName(equipment.getName());
        dto.setCategory(equipment.getCategory());
        dto.setSerialNumber(equipment.getSerialNumber());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
}