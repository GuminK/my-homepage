package com.myhomepage.domain.chordsheet.dto;

import com.myhomepage.domain.chordsheet.ChordSheet;

import java.time.LocalDateTime;

public record ChordSheetListResponse(
        Long id,
        String title,
        String artist,
        int capo,
        AuthorDto author,
        LocalDateTime createdAt
) {
    public static ChordSheetListResponse from(ChordSheet c) {
        return new ChordSheetListResponse(
                c.getId(),
                c.getTitle(),
                c.getArtist(),
                c.getCapo(),
                new AuthorDto(c.getAuthor().getId(), c.getAuthor().getNickname()),
                c.getCreatedAt()
        );
    }

    public record AuthorDto(Long id, String nickname) {}
}
