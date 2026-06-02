package com.myhomepage.domain.schedule;

import com.myhomepage.domain.schedule.dto.ScheduleCreateRequest;
import com.myhomepage.domain.schedule.dto.ScheduleResponse;
import com.myhomepage.global.common.ApiResponse;
import com.myhomepage.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Schedule", description = "합주실 예약 API")
@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Operation(summary = "일정 목록 조회 (날짜 범위)")
    @GetMapping
    public ApiResponse<List<ScheduleResponse>> getSchedules(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ApiResponse.ok(scheduleService.getSchedules(start, end));
    }

    @Operation(summary = "일정 예약 (로그인 필요)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ScheduleResponse> createSchedule(
            @Valid @RequestBody ScheduleCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(scheduleService.createSchedule(request, userDetails.getId()));
    }

    @Operation(summary = "일정 수정 (관리자 전용)")
    @PutMapping("/{scheduleId}")
    public ApiResponse<ScheduleResponse> updateSchedule(
            @PathVariable Long scheduleId,
            @Valid @RequestBody ScheduleCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(scheduleService.updateSchedule(scheduleId, request, userDetails.getId()));
    }

    @Operation(summary = "일정 취소 (예약자 본인 또는 관리자)")
    @DeleteMapping("/{scheduleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSchedule(
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        scheduleService.deleteSchedule(scheduleId, userDetails.getId());
    }
}
