package com.myhomepage.domain.chat;

import com.myhomepage.domain.chat.dto.ChatMessageRequest;
import com.myhomepage.domain.user.User;
import com.myhomepage.domain.user.UserRepository;
import com.myhomepage.global.error.BusinessException;
import com.myhomepage.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    public List<ChatRoom> getMyChatRooms(Long userId) {
        return chatRepository.findAllByUserId(userId);
    }

    @Transactional
    public ChatRoom getOrCreateRoom(Long myId, Long targetUserId) {
        return chatRepository.findByParticipants(myId, targetUserId)
                .orElseGet(() -> {
                    User me = userRepository.findById(myId)
                            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
                    User target = userRepository.findById(targetUserId)
                            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
                    return chatRepository.save(ChatRoom.builder().sender(me).receiver(target).build());
                });
    }

    @Transactional
    public ChatMessage sendMessage(Long roomId, ChatMessageRequest request, Long senderId) {
        ChatRoom room = chatRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        if (!room.hasParticipant(senderId)) {
            throw new BusinessException(ErrorCode.CHAT_ACCESS_DENIED);
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .content(request.content())
                .build();

        room.getMessages().add(message);
        return message;
    }
}
