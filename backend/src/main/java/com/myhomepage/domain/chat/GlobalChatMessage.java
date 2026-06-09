package com.myhomepage.domain.chat;

import com.myhomepage.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "global_chat_messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GlobalChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private LocalDateTime sentAt;

    @Builder
    public GlobalChatMessage(User sender, String content) {
        this.sender = sender;
        this.content = content;
        this.sentAt = LocalDateTime.now();
    }
}
