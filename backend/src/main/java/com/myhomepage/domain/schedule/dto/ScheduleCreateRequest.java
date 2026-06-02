package com.myhomepage.domain.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleCreateRequest(
        @NotBlank(message = "예약자 이름을 입력해주세요")
        @Size(max = 50)
        String reserverName,

        @NotBlank(message = "합주곡 이름을 입력해주세요")
        @Size(max = 100)
        String songName,

        @NotNull(message = "날짜를 선택해주세요")
        LocalDate date,

        @NotNull(message = "시작 시간을 선택해주세요")
        LocalTime startTime,

        @NotNull(message = "종료 시간을 선택해주세요")
        LocalTime endTime
) {}
