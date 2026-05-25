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

    public Page<Notice> getNotices(Pageable pageable) {
        return noticeRepository.findAllByOrderByPinnedDescCreatedAtDesc(pageable);
    }

    public Notice getNotice(Long noticeId) {
        return noticeRepository.findByIdWithAuthor(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
    }

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

    @Transactional
    public Notice updateNotice(Long noticeId, NoticeCreateRequest request) {
        Notice notice = noticeRepository.findByIdWithAuthor(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
        notice.update(request.title(), request.content(), request.pinned());
        return notice;
    }

    @Transactional
    public void deleteNotice(Long noticeId) {
        noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
        noticeRepository.deleteById(noticeId);
    }
}
