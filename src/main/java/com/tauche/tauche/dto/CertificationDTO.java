package com.tauche.tauche.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificationDTO {
    
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String certificationName;

    @NotBlank
    @Size(max = 100)
    private String agency;

    private Integer maxDepth;
    private LocalDate dateIssued;
    private LocalDate expiryDate;

    @Size(max = 100)
    private String certificationNumber;

    private Boolean isActive;
    private Boolean isExpired;
    private Integer daysUntilExpiry;
}
