package com.myhomepage.domain.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<ChatRoom, Long> {

    @Query("SELECT r FROM ChatRoom r JOIN FETCH r.sender JOIN FETCH r.receiver WHERE r.sender.id = :userId OR r.receiver.id = :userId ORDER BY r.createdAt DESC")
    List<ChatRoom> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM ChatRoom r JOIN FETCH r.sender JOIN FETCH r.receiver WHERE (r.sender.id = :userId1 AND r.receiver.id = :userId2) OR (r.sender.id = :userId2 AND r.receiver.id = :userId1)")
    Optional<ChatRoom> findByParticipants(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT r FROM ChatRoom r JOIN FETCH r.sender JOIN FETCH r.receiver WHERE r.id = :roomId")
    Optional<ChatRoom> findByIdWithParticipants(@Param("roomId") Long roomId);
}
