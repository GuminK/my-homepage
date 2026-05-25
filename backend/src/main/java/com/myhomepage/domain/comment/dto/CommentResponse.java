package com.myhomepage.domain.comment.dto;

import com.myhomepage.domain.comment.Comment;

import java.time.LocalDateTime;
import java.util.List;

public record CommentResponse(
        Long id,
        String content,
        AuthorDto author,
        List<CommentResponse> replies,
        LocalDateTime createdAt
) {
    public record AuthorDto(Long id, String nickname, String profileImageUrl) {}

    public static CommentResponse from(Comment comment) {
        List<CommentResponse> replies = comment.getReplies().stream()
                .map(CommentResponse::from)
                .toList();
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                new AuthorDto(
                        comment.getAuthor().getId(),
                        comment.getAuthor().getNickname(),
                        comment.getAuthor().getProfileImageUrl()
                ),
                replies,
                comment.getCreatedAt()
        );
    }
}
