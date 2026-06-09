package com.myhomepage.domain.chat;

import com.myhomepage.domain.chat.dto.GlobalChatMessageResponse;
import com.myhomepage.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat/global")
@RequiredArgsConstructor
public class GlobalChatController {

    private final GlobalChatService globalChatService;

    /** 전체 채팅 메시지 목록 조회 */
    @GetMapping("/messages")
    public ApiResponse<List<GlobalChatMessageResponse>> getMessages() {
        return ApiResponse.ok(globalChatService.getMessages());
    }
}
