package com.myhomepage.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PostCreateRequest(
        @NotBlank(message = "제목을 입력해주세요")
        @Size(max = 200, message = "제목은 200자 이내여야 합니다")
        String title,

        @NotBlank(message = "내용을 입력해주세요")
        String content,

        List<Long> fileIds  // 업로드된 파일 ID 목록
) {}
