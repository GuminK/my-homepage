package com.myhomepage.domain.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentCreateRequest(
        @NotBlank(message = "댓글 내용을 입력해주세요")
        @Size(max = 500, message = "댓글은 500자 이내여야 합니다")
        String content,

        Long parentId  // null이면 최상위 댓글, 값이 있으면 대댓글
) {}
