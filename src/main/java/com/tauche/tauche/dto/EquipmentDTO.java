package com.tauche.tauche.dto;

import java.time.LocalDate;

public class EquipmentDTO {
    private Long id;
    private String name;
    private String category;
    private String serialNumber;
    private LocalDate purchaseDate;
    private LocalDate lastServiceDate;
    private Integer serviceIntervalDives;
    private Integer serviceIntervalMonths;
    private Boolean isActive;
    private String notes;

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