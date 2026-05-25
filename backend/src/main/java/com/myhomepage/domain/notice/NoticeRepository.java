package com.myhomepage.domain.notice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    @Query(value = "SELECT n FROM Notice n JOIN FETCH n.author ORDER BY n.pinned DESC, n.updatedAt DESC",
           countQuery = "SELECT COUNT(n) FROM Notice n")
    Page<Notice> findAllByOrderByPinnedDescCreatedAtDesc(Pageable pageable);

    List<Notice> findAllByPinnedTrueOrderByCreatedAtDesc();

    @Query("SELECT n FROM Notice n JOIN FETCH n.author WHERE n.id = :id")
    Optional<Notice> findByIdWithAuthor(Long id);
}
