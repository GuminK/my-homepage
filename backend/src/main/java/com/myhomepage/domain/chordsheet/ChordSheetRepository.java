package com.myhomepage.domain.chordsheet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChordSheetRepository extends JpaRepository<ChordSheet, Long> {

    @Query("SELECT c FROM ChordSheet c JOIN FETCH c.author ORDER BY c.createdAt DESC")
    List<ChordSheet> findAllWithAuthor();

    @Query("SELECT c FROM ChordSheet c JOIN FETCH c.author WHERE c.id = :id")
    Optional<ChordSheet> findByIdWithAuthor(@Param("id") Long id);
}
