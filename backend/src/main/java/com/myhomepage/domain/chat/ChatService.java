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

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    /**
     * 내 채팅방 목록 반환 — 상대방 ID 기준으로 중복 방을 제거해 1:1 대화당 1개만 표시.
     * DB에 동일 상대와의 방이 여러 개 존재해도 최신 방 하나만 노출된다.
     */
    public List<ChatRoomResponse> getMyChatRooms(Long userId) {
        return chatRepository.findAllByUserId(userId).stream()
                .map(ChatRoomResponse::from)
                .collect(Collectors.toMap(
                        r -> r.senderId().equals(userId) ? r.receiverId() : r.senderId(),
                        r -> r,
                        (a, b) -> a,  // 중복 시 최신(첫 번째) 유지
                        LinkedHashMap::new
                ))
                .values().stream()
                .toList();
    }

    /** 두 사용자 간 채팅방 조회 또는 생성 — 이미 방이 있으면 기존 방을 반환 */
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

    /** 채팅방 메시지 목록 조회 — 참여자 권한 검증 후 메시지 반환 */
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

    /** 메시지 전송 — 참여자 권한 검증 후 DB 저장, WebSocket 브로드캐스트용 DTO 반환 */
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

    /** 나를 제외한 전체 사용자 목록 반환 — 채팅 시작 대상 선택에 사용 */
    public List<UserResponse> getAllUsersExcept(Long myId) {
        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(myId))
                .map(UserResponse::from)
                .toList();
    }
}
