package com.myhomepage.domain.comment;

import com.myhomepage.domain.post.Post;
import com.myhomepage.domain.user.User;
import com.myhomepage.global.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 대댓글 지원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> replies = new ArrayList<>();

    @Builder
    public Comment(Post post, User author, String content, Comment parent) {
        this.post = post;
        this.author = author;
        this.content = content;
        this.parent = parent;
    }

    public void update(String content) {
        this.content = content;
    }

    public boolean isAuthor(Long userId) {
        return this.author.getId().equals(userId);
    }
}
