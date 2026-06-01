package com.myhomepage.domain.notice;

import com.myhomepage.domain.notice.dto.NoticeCreateRequest;
import com.myhomepage.domain.user.User;
import com.myhomepage.domain.user.UserRepository;
import com.myhomepage.global.error.BusinessException;
import com.myhomepage.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;

    /** 공지사항 목록 반환 — 고정(pinned) 공지 우선, 그 다음 최신순 정렬 */
    public Page<Notice> getNotices(Pageable pageable) {
        return noticeRepository.findAllByOrderByPinnedDescCreatedAtDesc(pageable);
    }

    /** 공지사항 단건 조회 (작성자 JOIN FETCH) */
    public Notice getNotice(Long noticeId) {
        return noticeRepository.findByIdWithAuthor(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
    }

    /** 공지사항 작성 — ADMIN/SUPER_ADMIN 권한 필요 */
    @Transactional
    public Notice createNotice(NoticeCreateRequest request, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Notice notice = Notice.builder()
                .author(admin)
                .title(request.title())
                .content(request.content())
                .pinned(request.pinned())
                .build();

        return noticeRepository.save(notice);
    }

    /** 공지사항 수정 — 제목, 내용, 고정 여부 모두 변경 가능 */
    @Transactional
    public Notice updateNotice(Long noticeId, NoticeCreateRequest request) {
        Notice notice = noticeRepository.findByIdWithAuthor(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
        notice.update(request.title(), request.content(), request.pinned());
        return notice;
    }

    /** 공지사항 삭제 */
    @Transactional
    public void deleteNotice(Long noticeId) {
        noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
        noticeRepository.deleteById(noticeId);
    }
}
