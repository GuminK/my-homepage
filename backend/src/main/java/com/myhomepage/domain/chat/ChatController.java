package com.myhomepage.domain.chat;

import com.myhomepage.global.common.ApiResponse;
import com.myhomepage.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Chat", description = "1:1 채팅 API")
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "내 채팅방 목록")
    @GetMapping("/rooms")
    public ApiResponse<List<ChatRoom>> getMyChatRooms(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(chatService.getMyChatRooms(userDetails.getId()));
    }

    @Operation(summary = "채팅방 조회 또는 생성 (상대방 userId)")
    @PostMapping("/rooms/{targetUserId}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<ChatRoom> getOrCreateRoom(
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(chatService.getOrCreateRoom(userDetails.getId(), targetUserId));
    }
}
