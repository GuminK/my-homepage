package com.myhomepage.domain.chat;

import com.myhomepage.domain.chat.dto.ChatMessageRequest;
import com.myhomepage.domain.chat.dto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    // 클라이언트: stompClient.publish({ destination: '/pub/chat/send/{roomId}', body: JSON.stringify({content: "..."}) })
    // 구독:       stompClient.subscribe('/sub/chat/{roomId}', callback)
    @MessageMapping("/chat/send/{roomId}")
    @SendTo("/sub/chat/{roomId}")
    public ChatMessageResponse sendMessage(
            @DestinationVariable Long roomId,
            ChatMessageRequest request,
            Principal principal) {
        Long senderId = Long.parseLong(principal.getName());
        return chatService.sendMessage(roomId, request, senderId);
    }
}
