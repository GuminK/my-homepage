package com.myhomepage.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "잘못된 입력값입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C002", "서버 오류가 발생했습니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "C003", "접근 권한이 없습니다."),

    // Auth
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "A001", "이메일 또는 비밀번호가 올바르지 않습니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "A002", "만료된 토큰입니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "A003", "유효하지 않은 토큰입니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "A004", "이미 사용 중인 이메일입니다."),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "A005", "이미 사용 중인 닉네임입니다."),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "사용자를 찾을 수 없습니다."),

    // Post
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "게시글을 찾을 수 없습니다."),
    POST_ACCESS_DENIED(HttpStatus.FORBIDDEN, "P002", "게시글 수정/삭제 권한이 없습니다."),

    // Comment
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "CM001", "댓글을 찾을 수 없습니다."),
    COMMENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "CM002", "댓글 수정/삭제 권한이 없습니다."),

    // Notice
    NOTICE_NOT_FOUND(HttpStatus.NOT_FOUND, "N001", "공지사항을 찾을 수 없습니다."),

    // Chat
    CHAT_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "CH001", "채팅방을 찾을 수 없습니다."),
    CHAT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "CH002", "채팅방 접근 권한이 없습니다."),

    // File
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "F001", "파일 업로드에 실패했습니다."),
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "F002", "파일을 찾을 수 없습니다."),
    FILE_SIZE_EXCEEDED(HttpStatus.BAD_REQUEST, "F003", "파일 크기가 초과되었습니다."),
    UNSUPPORTED_FILE_TYPE(HttpStatus.BAD_REQUEST, "F004", "지원하지 않는 파일 형식입니다."),

    // Schedule
    SCHEDULE_NOT_FOUND(HttpStatus.NOT_FOUND, "SC001", "일정을 찾을 수 없습니다."),
    SCHEDULE_CONFLICT(HttpStatus.CONFLICT, "SC002", "해당 시간에 이미 예약이 있습니다."),
    SCHEDULE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "SC003", "일정 취소 권한이 없습니다."),
    SCHEDULE_INVALID_TIME(HttpStatus.BAD_REQUEST, "SC004", "시간은 30분 단위로만 설정 가능합니다."),
    SCHEDULE_OUT_OF_RANGE(HttpStatus.BAD_REQUEST, "SC005", "예약 가능한 날짜 범위를 초과했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
