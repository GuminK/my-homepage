package com.myhomepage.domain.user;

import com.myhomepage.domain.user.dto.LoginRequest;
import com.myhomepage.domain.user.dto.SignupRequest;
import com.myhomepage.domain.user.dto.TokenResponse;
import com.myhomepage.domain.user.dto.UserResponse;
import com.myhomepage.global.error.BusinessException;
import com.myhomepage.global.error.ErrorCode;
import com.myhomepage.global.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    /** 회원가입 — 이메일/닉네임 중복 검사 후 비밀번호 BCrypt 암호화하여 저장, 기본 역할은 USER */
    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (userRepository.existsByNickname(request.nickname())) {
            throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);
        }
        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .nickname(request.nickname())
                .role(UserRole.USER)
                .build();
        userRepository.save(user);
    }

    /** 로그인 — 이메일로 사용자 조회 후 비밀번호 검증, 성공 시 AccessToken + RefreshToken 발급 */
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());
        return TokenResponse.of(accessToken, refreshToken);
    }

    /** 내 프로필 조회 */
    public UserResponse getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }

    /** 닉네임 수정 — 다른 사용자와 중복 불가 */
    @Transactional
    public UserResponse updateNickname(Long userId, String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.updateProfile(nickname, user.getProfileImageUrl());
        return UserResponse.from(user);
    }
}
