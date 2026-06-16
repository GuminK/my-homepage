package com.myhomepage.domain.chordsheet.dto;

import com.myhomepage.domain.chordsheet.ChordSheet;

import java.time.LocalDateTime;

public record ChordSheetResponse(
        Long id,
        String title,
        String artist,
        String content,
        int capo,
        AuthorDto author,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ChordSheetResponse from(ChordSheet c) {
        return new ChordSheetResponse(
                c.getId(),
                c.getTitle(),
                c.getArtist(),
                c.getContent(),
                c.getCapo(),
                new AuthorDto(c.getAuthor().getId(), c.getAuthor().getNickname()),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }

    public record AuthorDto(Long id, String nickname) {}
}
