package com.myhomepage.domain.file;

import com.myhomepage.global.common.ApiResponse;
import com.myhomepage.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "File", description = "파일 업로드 API")
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @Operation(summary = "파일 업로드 (이미지/동영상/문서)")
    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FileInfoResponse> upload(
            @RequestPart MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        FileInfo fileInfo = fileService.upload(file, userDetails.getId());
        return ApiResponse.ok(FileInfoResponse.from(fileInfo));
    }

    public record FileInfoResponse(
            Long id, String originalName, String fileUrl, String fileType, long fileSize
    ) {
        public static FileInfoResponse from(FileInfo f) {
            return new FileInfoResponse(f.getId(), f.getOriginalName(), f.getFileUrl(),
                    f.getFileType().name(), f.getFileSize());
        }
    }
}
