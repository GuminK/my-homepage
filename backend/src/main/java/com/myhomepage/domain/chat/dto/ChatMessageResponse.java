package com.myhomepage.domain.chat.dto;

import com.myhomepage.domain.chat.ChatMessage;

public record ChatMessageResponse(
        Long id,
        Long senderId,
        String senderNickname,
        String content,
        String sentAt
) {
    public static ChatMessageResponse from(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getNickname(),
                message.getContent(),
                message.getSentAt().toString()
        );
    }
}
