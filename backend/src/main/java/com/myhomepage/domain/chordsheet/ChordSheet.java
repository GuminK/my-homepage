package com.myhomepage.domain.chordsheet;

import com.myhomepage.domain.user.User;
import com.myhomepage.global.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chord_sheets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChordSheet extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 100)
    private String artist;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private int capo = 0;

    @Builder
    public ChordSheet(User author, String title, String artist, String content, int capo) {
        this.author = author;
        this.title = title;
        this.artist = artist;
        this.content = content;
        this.capo = capo;
    }

    public void update(String title, String artist, String content, int capo) {
        this.title = title;
        this.artist = artist;
        this.content = content;
        this.capo = capo;
    }

    public boolean isAuthor(Long userId) {
        return this.author.getId().equals(userId);
    }
}
