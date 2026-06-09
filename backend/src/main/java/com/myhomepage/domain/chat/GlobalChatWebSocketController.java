package com.myhomepage.domain.chat;

import com.myhomepage.domain.chat.dto.ChatMessageRequest;
import com.myhomepage.domain.chat.dto.GlobalChatMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class GlobalChatWebSocketController {

    private final GlobalChatService globalChatService;

    // 클라이언트: stompClient.publish({ destination: '/pub/global/send', body: JSON.stringify({content: "..."}) })
    // 구독:       stompClient.subscribe('/sub/global', callback)
    @MessageMapping("/global/send")
    @SendTo("/sub/global")
    public GlobalChatMessageResponse sendMessage(ChatMessageRequest request, Principal principal) {
        Long senderId = Long.parseLong(principal.getName());
        return globalChatService.sendMessage(request, senderId);
    }
}
