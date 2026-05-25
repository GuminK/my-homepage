package com.myhomepage.domain.notice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NoticeCreateRequest(
        @NotBlank(message = "제목을 입력해주세요")
        @Size(max = 200)
        String title,

        @NotBlank(message = "내용을 입력해주세요")
        String content,

        boolean pinned
) {}
