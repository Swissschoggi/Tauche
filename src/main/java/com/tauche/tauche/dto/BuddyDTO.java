package com.tauche.tauche.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuddyDTO {
    private Long id;
    private Long buddyId;
    private String buddyEmail;
    private String status;
    private String createdAt;
}
