package com.myhomepage.domain.file;

import com.myhomepage.domain.user.User;
import com.myhomepage.domain.user.UserRepository;
import com.myhomepage.global.error.BusinessException;
import com.myhomepage.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FileService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final S3Client s3Client;

    @Value("${storage.minio.endpoint:}")
    private String minioEndpoint;

    @Value("${storage.minio.bucket-name:myhomepage}")
    private String minioBucketName;

    @Value("${storage.s3.bucket-name:}")
    private String s3BucketName;

    @Value("${storage.s3.region:ap-northeast-2}")
    private String s3Region;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList(
            "video/mp4", "video/webm", "video/quicktime"
    );

    /**
     * 파일 업로드 — MinIO(S3 호환)에 저장 후 FileInfo를 DB에 기록하고 반환.
     * 파일명 충돌 방지를 위해 UUID로 저장명 생성, 원본 파일명은 별도 보존.
     */
    @Transactional
    public FileInfo upload(MultipartFile file, Long uploaderId) {
        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        FileType fileType = determineFileType(file.getContentType());
        String storedName = UUID.randomUUID() + getExtension(file.getOriginalFilename());
        String fileUrl = uploadToStorage(file, storedName);

        FileInfo fileInfo = FileInfo.builder()
                .uploader(uploader)
                .originalName(file.getOriginalFilename())
                .storedName(storedName)
                .fileUrl(fileUrl)
                .fileType(fileType)
                .fileSize(file.getSize())
                .build();

        return fileRepository.save(fileInfo);
    }

    private String uploadToStorage(MultipartFile file, String storedName) {
        boolean isMinio = minioEndpoint != null && !minioEndpoint.isBlank();
        String bucket = isMinio ? minioBucketName : s3BucketName;
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(storedName)
                    .contentType(file.getContentType())
                    .build();
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
            if (isMinio) {
                return String.format("%s/%s/%s", minioEndpoint, bucket, storedName);
            }
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, s3Region, storedName);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    /** MIME 타입으로 파일 종류 분류 — IMAGE / VIDEO / DOCUMENT */
    private FileType determineFileType(String contentType) {
        if (contentType == null) throw new BusinessException(ErrorCode.UNSUPPORTED_FILE_TYPE);
        if (ALLOWED_IMAGE_TYPES.contains(contentType)) return FileType.IMAGE;
        if (ALLOWED_VIDEO_TYPES.contains(contentType)) return FileType.VIDEO;
        return FileType.DOCUMENT;
    }

    /** 파일명에서 확장자 추출 (예: ".jpg") */
    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }
}
