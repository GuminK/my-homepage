package com.myhomepage.domain.admin;

import com.myhomepage.domain.admin.dto.UserRoleUpdateRequest;
import com.myhomepage.domain.admin.dto.UserSummaryResponse;
import com.myhomepage.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin", description = "슈퍼 관리자 API")
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "전체 회원 목록 조회")
    @GetMapping("/users")
    public ApiResponse<List<UserSummaryResponse>> getUsers() {
        return ApiResponse.ok(adminService.getUsers());
    }

    @Operation(summary = "회원 역할 변경")
    @PatchMapping("/users/{userId}/role")
    public ApiResponse<UserSummaryResponse> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleUpdateRequest request) {
        return ApiResponse.ok(adminService.updateUserRole(userId, request));
    }
}
