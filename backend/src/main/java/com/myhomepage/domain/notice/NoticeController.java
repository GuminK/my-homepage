package com.myhomepage.domain.notice;

import com.myhomepage.domain.notice.dto.NoticeCreateRequest;
import com.myhomepage.global.common.ApiResponse;
import com.myhomepage.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Notice", description = "공지사항 API (관리자 전용 작성)")
@RestController
@RequestMapping("/api/v1/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @Operation(summary = "공지사항 목록")
    @GetMapping
    public ApiResponse<Page<Notice>> getNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(noticeService.getNotices(
                PageRequest.of(page, size, Sort.by("pinned").descending().and(Sort.by("createdAt").descending()))));
    }

    @Operation(summary = "공지사항 상세")
    @GetMapping("/{noticeId}")
    public ApiResponse<Notice> getNotice(@PathVariable Long noticeId) {
        return ApiResponse.ok(noticeService.getNotice(noticeId));
    }

    @Operation(summary = "공지사항 작성 (관리자)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<Notice> createNotice(
            @Valid @RequestBody NoticeCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(noticeService.createNotice(request, userDetails.getId()));
    }

    @Operation(summary = "공지사항 수정 (관리자)")
    @PutMapping("/{noticeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<Notice> updateNotice(
            @PathVariable Long noticeId,
            @Valid @RequestBody NoticeCreateRequest request) {
        return ApiResponse.ok(noticeService.updateNotice(noticeId, request));
    }

    @Operation(summary = "공지사항 삭제 (관리자)")
    @DeleteMapping("/{noticeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public void deleteNotice(@PathVariable Long noticeId) {
        noticeService.deleteNotice(noticeId);
    }
}
