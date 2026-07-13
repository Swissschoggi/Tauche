package com.tauche.tauche.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {
    private Long id;
    private String email;
    private String role;
    private boolean enabled;
    private long diveCount;
    private long buddyCount;
    private String joinedAt;
}
