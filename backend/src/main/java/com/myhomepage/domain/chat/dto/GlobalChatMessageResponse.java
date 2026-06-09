package com.myhomepage.domain.chat.dto;

import com.myhomepage.domain.chat.GlobalChatMessage;

import java.time.LocalDateTime;

public record GlobalChatMessageResponse(
        Long id,
        Long senderId,
        String senderNickname,
        String content,
        LocalDateTime sentAt
) {
    public static GlobalChatMessageResponse from(GlobalChatMessage msg) {
        return new GlobalChatMessageResponse(
                msg.getId(),
                msg.getSender().getId(),
                msg.getSender().getNickname(),
                msg.getContent(),
                msg.getSentAt()
        );
    }
}
