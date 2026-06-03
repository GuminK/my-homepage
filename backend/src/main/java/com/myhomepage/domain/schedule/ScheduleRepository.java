package com.myhomepage.domain.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    /** 특정 날짜 범위의 일정 조회 (user JOIN FETCH로 N+1 방지) */
    @Query("SELECT s FROM Schedule s JOIN FETCH s.user WHERE s.date BETWEEN :start AND :end ORDER BY s.date, s.startTime")
    List<Schedule> findByDateBetweenWithUser(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /** 특정 날짜에 시간이 겹치는 일정 조회 — 새 예약 전 충돌 검사에 사용 */
    @Query("SELECT s FROM Schedule s WHERE s.date = :date AND s.startTime < :endTime AND s.endTime > :startTime")
    List<Schedule> findOverlapping(@Param("date") LocalDate date,
                                   @Param("startTime") LocalTime startTime,
                                   @Param("endTime") LocalTime endTime);

    /** 충돌 검사 시 자기 자신(수정 중인 일정)은 제외 */
    @Query("SELECT s FROM Schedule s WHERE s.date = :date AND s.startTime < :endTime AND s.endTime > :startTime AND s.id <> :excludeId")
    List<Schedule> findOverlappingExcluding(@Param("date") LocalDate date,
                                            @Param("startTime") LocalTime startTime,
                                            @Param("endTime") LocalTime endTime,
                                            @Param("excludeId") Long excludeId);

    @Query("SELECT s FROM Schedule s JOIN FETCH s.user WHERE s.id = :id")
    Optional<Schedule> findByIdWithUser(@Param("id") Long id);
}
