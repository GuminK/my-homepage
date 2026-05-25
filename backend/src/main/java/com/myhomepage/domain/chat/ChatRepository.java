package com.myhomepage.domain.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<ChatRoom, Long> {

    // 특정 유저가 참여한 모든 채팅방
    @Query("SELECT r FROM ChatRoom r WHERE r.sender.id = :userId OR r.receiver.id = :userId ORDER BY r.createdAt DESC")
    List<ChatRoom> findAllByUserId(@Param("userId") Long userId);

    // 두 유저 간의 기존 채팅방 조회 (중복 생성 방지)
    @Query("SELECT r FROM ChatRoom r WHERE (r.sender.id = :userId1 AND r.receiver.id = :userId2) OR (r.sender.id = :userId2 AND r.receiver.id = :userId1)")
    Optional<ChatRoom> findByParticipants(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
