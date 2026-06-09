package com.myhomepage.domain.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GlobalChatMessageRepository extends JpaRepository<GlobalChatMessage, Long> {

    /** 전체 채팅 메시지 전체 조회 — sender JOIN FETCH로 N+1 방지 */
    @Query("SELECT g FROM GlobalChatMessage g JOIN FETCH g.sender ORDER BY g.sentAt ASC")
    List<GlobalChatMessage> findAllWithSender();
}
