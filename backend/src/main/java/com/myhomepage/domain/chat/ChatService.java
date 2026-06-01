package com.myhomepage.domain.chat;

import com.myhomepage.domain.chat.dto.ChatMessageRequest;
import com.myhomepage.domain.chat.dto.ChatMessageResponse;
import com.myhomepage.domain.chat.dto.ChatRoomResponse;
import com.myhomepage.domain.user.User;
import com.myhomepage.domain.user.UserRepository;
import com.myhomepage.domain.user.dto.UserResponse;
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
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public List<ChatRoomResponse> getMyChatRooms(Long userId) {
        return chatRepository.findAllByUserId(userId).stream()
                .map(ChatRoomResponse::from)
                .toList();
    }

    @Transactional
    public ChatRoomResponse getOrCreateRoom(Long myId, Long targetUserId) {
        ChatRoom room = chatRepository.findByParticipants(myId, targetUserId)
                .orElseGet(() -> {
                    User me = userRepository.findById(myId)
                            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
                    User target = userRepository.findById(targetUserId)
                            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
                    return chatRepository.save(ChatRoom.builder().sender(me).receiver(target).build());
                });
        return ChatRoomResponse.from(room);
    }

    public List<ChatMessageResponse> getMessages(Long roomId, Long userId) {
        ChatRoom room = chatRepository.findByIdWithParticipants(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHAT_ROOM_NOT_FOUND));
        if (!room.hasParticipant(userId)) {
            throw new BusinessException(ErrorCode.CHAT_ACCESS_DENIED);
        }
        return chatMessageRepository.findByRoomIdWithSender(roomId).stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long roomId, ChatMessageRequest request, Long senderId) {
        ChatRoom room = chatRepository.findByIdWithParticipants(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        if (!room.hasParticipant(senderId)) {
            throw new BusinessException(ErrorCode.CHAT_ACCESS_DENIED);
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ChatMessage message = chatMessageRepository.save(ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .content(request.content())
                .build());

        return ChatMessageResponse.from(message);
    }

    public List<UserResponse> getAllUsersExcept(Long myId) {
        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(myId))
                .map(UserResponse::from)
                .toList();
    }
}
