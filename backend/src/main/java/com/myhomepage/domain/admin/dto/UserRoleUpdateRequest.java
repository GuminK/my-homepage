package com.myhomepage.domain.admin.dto;

import com.myhomepage.domain.user.UserRole;
import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateRequest(
        @NotNull
        UserRole role
) {}
