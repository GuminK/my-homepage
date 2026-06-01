package com.myhomepage.domain.chat;

import com.myhomepage.domain.chat.dto.ChatMessageResponse;
import com.myhomepage.domain.chat.dto.ChatRoomResponse;
import com.myhomepage.domain.user.dto.UserResponse;
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
    public ApiResponse<List<ChatRoomResponse>> getMyChatRooms(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(chatService.getMyChatRooms(userDetails.getId()));
    }

    @Operation(summary = "채팅방 조회 또는 생성")
    @PostMapping("/rooms/{targetUserId}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<ChatRoomResponse> getOrCreateRoom(
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(chatService.getOrCreateRoom(userDetails.getId(), targetUserId));
    }

    @Operation(summary = "채팅방 메시지 목록")
    @GetMapping("/rooms/{roomId}/messages")
    public ApiResponse<List<ChatMessageResponse>> getMessages(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(chatService.getMessages(roomId, userDetails.getId()));
    }

    @Operation(summary = "채팅 가능한 사용자 목록")
    @GetMapping("/users")
    public ApiResponse<List<UserResponse>> getChatableUsers(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(chatService.getAllUsersExcept(userDetails.getId()));
    }
}
