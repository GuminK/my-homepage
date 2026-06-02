package com.myhomepage.domain.user;

import com.myhomepage.domain.user.dto.LoginRequest;
import com.myhomepage.domain.user.dto.NicknameUpdateRequest;
import com.myhomepage.domain.user.dto.SignupRequest;
import com.myhomepage.domain.user.dto.TokenResponse;
import com.myhomepage.domain.user.dto.UserResponse;
import com.myhomepage.global.common.ApiResponse;
import com.myhomepage.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "인증/인가 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "회원가입")
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> signup(@Valid @RequestBody SignupRequest request) {
        userService.signup(request);
        return ApiResponse.ok(null);
    }

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(userService.login(request));
    }

    @Operation(summary = "내 프로필 조회")
    @GetMapping("/me")
    public ApiResponse<UserResponse> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(userService.getMyProfile(userDetails.getId()));
    }

    @Operation(summary = "닉네임 수정")
    @PatchMapping("/me/nickname")
    public ApiResponse<UserResponse> updateNickname(
            @Valid @RequestBody NicknameUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(userService.updateNickname(userDetails.getId(), request.nickname()));
    }
}
