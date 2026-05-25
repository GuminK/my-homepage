package com.myhomepage.domain.post.dto;

import com.myhomepage.domain.file.FileInfo;
import com.myhomepage.domain.post.Post;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
        Long id,
        String title,
        String content,
        AuthorDto author,
        long viewCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<AttachmentDto> attachments
) {
    public static PostResponse from(Post post) {
        List<AttachmentDto> attachments = post.getAttachments().stream()
                .map(AttachmentDto::from)
                .toList();
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                new AuthorDto(post.getAuthor().getId(), post.getAuthor().getNickname(),
                        post.getAuthor().getProfileImageUrl()),
                post.getViewCount(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                attachments
        );
    }

    public record AuthorDto(Long id, String nickname, String profileImageUrl) {}

    public record AttachmentDto(Long id, String originalName, String fileUrl, String fileType, long fileSize) {
        public static AttachmentDto from(FileInfo f) {
            return new AttachmentDto(f.getId(), f.getOriginalName(), f.getFileUrl(),
                    f.getFileType().name(), f.getFileSize());
        }
    }
}
