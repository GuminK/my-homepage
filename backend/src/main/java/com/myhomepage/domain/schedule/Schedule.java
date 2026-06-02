package com.myhomepage.domain.schedule;

import com.myhomepage.domain.user.User;
import com.myhomepage.global.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Schedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String reserverName;

    @Column(nullable = false, length = 100)
    private String songName;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Builder
    public Schedule(User user, String reserverName, String songName,
                    LocalDate date, LocalTime startTime, LocalTime endTime) {
        this.user = user;
        this.reserverName = reserverName;
        this.songName = songName;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public void update(String reserverName, String songName,
                       LocalDate date, LocalTime startTime, LocalTime endTime) {
        this.reserverName = reserverName;
        this.songName = songName;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public boolean isOwner(Long userId) {
        return this.user.getId().equals(userId);
    }
}
