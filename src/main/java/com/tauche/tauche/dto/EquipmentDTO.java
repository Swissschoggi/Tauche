package com.tauche.tauche.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EquipmentDTO {
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String category;
    @Size(max = 100)
    private String serialNumber;

    private LocalDate purchaseDate;
    private LocalDate lastServiceDate;
    private Integer serviceIntervalDives;
    private Integer serviceIntervalMonths;
    private Boolean isActive;

    @Size(max = 2000)
    private String notes;

    @Size(max = 100)
    private String manufacturer;

    @Size(max = 100)
    private String model;

    private Double purchasePrice;

    @Size(max = 2000)
    private String lastServiceNotes;

    private long totalDivesWithGear;
    private long totalMinutesWithGear;
    private long divesSinceLastService;
    private long daysRemainingUntilService;
    private boolean requiresService;

    public EquipmentDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    public LocalDate getLastServiceDate() { return lastServiceDate; }
    public void setLastServiceDate(LocalDate lastServiceDate) { this.lastServiceDate = lastServiceDate; }
    public Integer getServiceIntervalDives() { return serviceIntervalDives; }
    public void setServiceIntervalDives(Integer serviceIntervalDives) { this.serviceIntervalDives = serviceIntervalDives; }
    public Integer getServiceIntervalMonths() { return serviceIntervalMonths; }
    public void setServiceIntervalMonths(Integer serviceIntervalMonths) { this.serviceIntervalMonths = serviceIntervalMonths; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public Double getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(Double purchasePrice) { this.purchasePrice = purchasePrice; }
    public String getLastServiceNotes() { return lastServiceNotes; }
    public void setLastServiceNotes(String lastServiceNotes) { this.lastServiceNotes = lastServiceNotes; }
    public long getTotalDivesWithGear() { return totalDivesWithGear; }
    public void setTotalDivesWithGear(long totalDivesWithGear) { this.totalDivesWithGear = totalDivesWithGear; }
    public long getTotalMinutesWithGear() { return totalMinutesWithGear; }
    public void setTotalMinutesWithGear(long totalMinutesWithGear) { this.totalMinutesWithGear = totalMinutesWithGear; }
    public long getDivesSinceLastService() { return divesSinceLastService; }
    public void setDivesSinceLastService(long divesSinceLastService) { this.divesSinceLastService = divesSinceLastService; }
    public long getDaysRemainingUntilService() { return daysRemainingUntilService; }
    public void setDaysRemainingUntilService(long daysRemainingUntilService) { this.daysRemainingUntilService = daysRemainingUntilService; }
    public boolean isRequiresService() { return requiresService; }
    public void setRequiresService(boolean requiresService) { this.requiresService = requiresService; }
}