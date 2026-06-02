package com.myhomepage.domain.schedule.dto;

import com.myhomepage.domain.schedule.Schedule;

public record ScheduleResponse(
        Long id,
        Long userId,
        String reserverName,
        String songName,
        String date,
        String startTime,
        String endTime,
        String createdAt
) {
    public static ScheduleResponse from(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getUser().getId(),
                schedule.getReserverName(),
                schedule.getSongName(),
                schedule.getDate().toString(),
                schedule.getStartTime().toString(),
                schedule.getEndTime().toString(),
                schedule.getCreatedAt().toString()
        );
    }
}
