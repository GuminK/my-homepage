package com.myhomepage.global.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * STOMP CONNECT 프레임의 Authorization 헤더에서 JWT를 추출해 인증 주체를 설정하는 인터셉터.
 * HTTP 필터(JwtAuthenticationFilter)는 WebSocket 업그레이드 이후의 STOMP 메시지를 처리하지 못하므로
 * WebSocket 인증은 이 인터셉터가 전담한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userDetailsService;

    /**
     * STOMP CONNECT 시 JWT를 검증하고 principal을 userId 문자열로 설정.
     * principal.getName()이 userId를 반환하도록 String을 주체로 사용.
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtProvider.validateToken(token)) {
                    Long userId = jwtProvider.getUserId(token);
                    UserDetails userDetails = userDetailsService.loadUserById(userId);
                    // principal을 userId 문자열로 설정 → principal.getName()이 userId 반환
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    String.valueOf(userId), null, userDetails.getAuthorities());
                    accessor.setUser(auth);
                    log.debug("WebSocket authenticated: userId={}", userId);
                }
            }
        }

        return message;
    }
}
