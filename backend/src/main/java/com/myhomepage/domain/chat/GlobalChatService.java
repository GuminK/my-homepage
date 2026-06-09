package com.myhomepage.domain.chat;

import com.myhomepage.domain.chat.dto.ChatMessageRequest;
import com.myhomepage.domain.chat.dto.GlobalChatMessageResponse;
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
public class GlobalChatService {

    private final GlobalChatMessageRepository globalChatMessageRepository;
    private final UserRepository userRepository;

    /** 전체 채팅 메시지 목록 조회 */
    public List<GlobalChatMessageResponse> getMessages() {
        return globalChatMessageRepository.findAllWithSender().stream()
                .map(GlobalChatMessageResponse::from)
                .toList();
    }

    /** 전체 채팅 메시지 저장 후 브로드캐스트용 DTO 반환 */
    @Transactional
    public GlobalChatMessageResponse sendMessage(ChatMessageRequest request, Long senderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        GlobalChatMessage message = GlobalChatMessage.builder()
                .sender(sender)
                .content(request.content())
                .build();
        return GlobalChatMessageResponse.from(globalChatMessageRepository.save(message));
    }
}
