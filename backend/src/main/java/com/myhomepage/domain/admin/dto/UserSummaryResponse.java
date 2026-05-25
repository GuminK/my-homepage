package com.myhomepage.domain.admin.dto;

import com.myhomepage.domain.user.User;
import com.myhomepage.domain.user.UserRole;

import java.time.LocalDateTime;

public record UserSummaryResponse(
        Long id,
        String email,
        String nickname,
        UserRole role,
        LocalDateTime createdAt
) {
    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
