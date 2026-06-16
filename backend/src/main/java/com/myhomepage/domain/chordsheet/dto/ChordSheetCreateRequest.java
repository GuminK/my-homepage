package com.myhomepage.domain.chordsheet.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChordSheetCreateRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 100) String artist,
        @NotBlank String content,
        @Min(0) @Max(11) int capo
) {}
