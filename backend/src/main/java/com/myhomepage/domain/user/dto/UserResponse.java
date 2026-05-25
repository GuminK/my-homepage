package com.myhomepage.domain.user.dto;

import com.myhomepage.domain.user.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        String nickname,
        String role,
        String profileImageUrl,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole().name(),
                user.getProfileImageUrl(),
                user.getCreatedAt()
        );
    }
}
