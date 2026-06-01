package com.myhomepage.domain.chat.dto;

import com.myhomepage.domain.chat.ChatRoom;

public record ChatRoomResponse(
        Long id,
        Long senderId,
        String senderNickname,
        Long receiverId,
        String receiverNickname,
        String createdAt
) {
    public static ChatRoomResponse from(ChatRoom room) {
        return new ChatRoomResponse(
                room.getId(),
                room.getSender().getId(),
                room.getSender().getNickname(),
                room.getReceiver().getId(),
                room.getReceiver().getNickname(),
                room.getCreatedAt().toString()
        );
    }
}
