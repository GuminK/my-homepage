package com.myhomepage.domain.chat;

import com.myhomepage.domain.user.User;
import com.myhomepage.global.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_rooms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1:1 채팅: 요청자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    // 1:1 채팅: 수신자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL)
    @OrderBy("sentAt ASC")
    private List<ChatMessage> messages = new ArrayList<>();

    @Builder
    public ChatRoom(User sender, User receiver) {
        this.sender = sender;
        this.receiver = receiver;
    }

    public boolean hasParticipant(Long userId) {
        return sender.getId().equals(userId) || receiver.getId().equals(userId);
    }
}
