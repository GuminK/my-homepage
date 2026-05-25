package com.myhomepage.domain.chat;

import com.myhomepage.domain.chat.dto.ChatMessageRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    // 클라이언트: stompClient.publish({ destination: '/pub/chat/send/1', body: JSON.stringify({content: "..."}}) })
    // 구독:       stompClient.subscribe('/sub/chat/1', callback)
    @MessageMapping("/chat/send/{roomId}")
    @SendTo("/sub/chat/{roomId}")
    public ChatMessage sendMessage(
            @DestinationVariable Long roomId,
            ChatMessageRequest request,
            Principal principal) {
        Long senderId = Long.parseLong(principal.getName());
        return chatService.sendMessage(roomId, request, senderId);
    }
}
