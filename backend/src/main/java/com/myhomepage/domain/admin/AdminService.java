package com.myhomepage.domain.admin;

import com.myhomepage.domain.admin.dto.UserRoleUpdateRequest;
import com.myhomepage.domain.admin.dto.UserSummaryResponse;
import com.myhomepage.domain.user.User;
import com.myhomepage.domain.user.UserRepository;
import com.myhomepage.domain.user.UserRole;
import com.myhomepage.global.error.BusinessException;
import com.myhomepage.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;

    /** 전체 사용자 목록 반환 */
    public List<UserSummaryResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(UserSummaryResponse::from)
                .toList();
    }

    /**
     * 사용자 역할 변경 — SUPER_ADMIN은 변경 불가,
     * 또한 SUPER_ADMIN 역할로의 승격도 이 API에서는 불가 (보안상 제한)
     */
    @Transactional
    public UserSummaryResponse updateUserRole(Long userId, UserRoleUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() == UserRole.SUPER_ADMIN) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        if (request.role() == UserRole.SUPER_ADMIN) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        user.changeRole(request.role());
        return UserSummaryResponse.from(user);
    }
}
