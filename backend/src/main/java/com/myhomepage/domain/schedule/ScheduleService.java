package com.myhomepage.domain.schedule;

import com.myhomepage.domain.schedule.dto.ScheduleCreateRequest;
import com.myhomepage.domain.schedule.dto.ScheduleResponse;
import com.myhomepage.domain.user.User;
import com.myhomepage.domain.user.UserRepository;
import com.myhomepage.domain.user.UserRole;
import com.myhomepage.global.error.BusinessException;
import com.myhomepage.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    /** 날짜 범위의 일정 목록 조회 — 최대 오늘~3개월 후까지만 허용 */
    public List<ScheduleResponse> getSchedules(LocalDate start, LocalDate end) {
        return scheduleRepository.findByDateBetweenWithUser(start, end).stream()
                .map(ScheduleResponse::from)
                .toList();
    }

    /** 일정 예약 — 30분 단위, 3개월 이내, 시간 충돌 검사 */
    @Transactional
    public ScheduleResponse createSchedule(ScheduleCreateRequest request, Long userId) {
        validateTime(request.startTime(), request.endTime());
        validateDateRange(request.date());

        List<Schedule> conflicts = scheduleRepository.findOverlapping(
                request.date(), request.startTime(), request.endTime());
        if (!conflicts.isEmpty()) {
            throw new BusinessException(ErrorCode.SCHEDULE_CONFLICT);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Schedule schedule = Schedule.builder()
                .user(user)
                .reserverName(request.reserverName())
                .songName(request.songName())
                .date(request.date())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .build();

        return ScheduleResponse.from(scheduleRepository.save(schedule));
    }

    /** 일정 수정 — 예약자 본인 또는 관리자, 충돌 검사 시 자기 자신 제외 */
    @Transactional
    public ScheduleResponse updateSchedule(Long scheduleId, ScheduleCreateRequest request, Long userId) {
        validateTime(request.startTime(), request.endTime());
        validateDateRange(request.date());

        Schedule schedule = scheduleRepository.findByIdWithUser(scheduleId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULE_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        boolean isAdmin = user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.SUPER_ADMIN;
        if (!schedule.isOwner(userId) && !isAdmin) {
            throw new BusinessException(ErrorCode.SCHEDULE_ACCESS_DENIED);
        }

        List<Schedule> conflicts = scheduleRepository.findOverlappingExcluding(
                request.date(), request.startTime(), request.endTime(), scheduleId);
        if (!conflicts.isEmpty()) {
            throw new BusinessException(ErrorCode.SCHEDULE_CONFLICT);
        }

        schedule.update(request.reserverName(), request.songName(),
                request.date(), request.startTime(), request.endTime());
        return ScheduleResponse.from(schedule);
    }

    /** 일정 취소 — 예약자 본인 또는 관리자만 가능 */
    @Transactional
    public void deleteSchedule(Long scheduleId, Long userId) {
        Schedule schedule = scheduleRepository.findByIdWithUser(scheduleId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULE_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        boolean isAdmin = user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.SUPER_ADMIN;
        if (!schedule.isOwner(userId) && !isAdmin) {
            throw new BusinessException(ErrorCode.SCHEDULE_ACCESS_DENIED);
        }

        scheduleRepository.delete(schedule);
    }

    /** 시작/종료 시간이 30분 단위인지, 시작이 종료보다 빠른지 검증 */
    private void validateTime(LocalTime startTime, LocalTime endTime) {
        if (startTime.getMinute() % 30 != 0 || startTime.getSecond() != 0) {
            throw new BusinessException(ErrorCode.SCHEDULE_INVALID_TIME);
        }
        if (endTime.getMinute() % 30 != 0 || endTime.getSecond() != 0) {
            throw new BusinessException(ErrorCode.SCHEDULE_INVALID_TIME);
        }
        if (!startTime.isBefore(endTime)) {
            throw new BusinessException(ErrorCode.SCHEDULE_INVALID_TIME);
        }
    }

    /** 예약 날짜가 오늘 이후, 3개월 이내인지 검증 */
    private void validateDateRange(LocalDate date) {
        LocalDate today = LocalDate.now();
        LocalDate maxDate = today.plusMonths(3);
        if (date.isBefore(today) || date.isAfter(maxDate)) {
            throw new BusinessException(ErrorCode.SCHEDULE_OUT_OF_RANGE);
        }
    }

    /** 관리자 권한 확인 */
    private void validateAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.getRole() == UserRole.USER) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }
}
