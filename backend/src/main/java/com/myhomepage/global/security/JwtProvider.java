package com.myhomepage.global.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-validity}")
    private long accessTokenValidity;

    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    private SecretKey secretKey;

    /** 애플리케이션 시작 시 JWT 서명용 SecretKey 초기화 */
    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    /** AccessToken 생성 — subject에 userId, claim에 email과 role 포함 */
    public String createAccessToken(Long userId, String email, String role) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenValidity))
                .signWith(secretKey)
                .compact();
    }

    /** RefreshToken 생성 — subject에 userId만 포함 */
    public String createRefreshToken(Long userId) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenValidity))
                .signWith(secretKey)
                .compact();
    }

    /** 토큰 유효성 검증 — 만료, 서명 오류 등 모든 JWT 예외를 false로 처리 */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /** 토큰에서 userId 추출 (subject 필드) */
    public Long getUserId(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    /** 토큰에서 role 추출 */
    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    /** 서명 검증 후 Claims(페이로드) 파싱 */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
