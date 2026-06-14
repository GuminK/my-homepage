package com.myhomepage.global.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutBucketPolicyRequest;

@Slf4j
@Component
@RequiredArgsConstructor
public class MinioInitializer implements ApplicationRunner {

    private final S3Client s3Client;

    @Value("${storage.minio.endpoint:}")
    private String minioEndpoint;

    @Value("${storage.minio.bucket-name:myhomepage}")
    private String bucketName;

    @Override
    public void run(ApplicationArguments args) {
        if (minioEndpoint == null || minioEndpoint.isBlank()) {
            log.info("MinIO not configured, skipping bucket initialization");
            return;
        }
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
            log.info("MinIO bucket '{}' already exists", bucketName);
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
            log.info("MinIO bucket '{}' created", bucketName);
        } catch (Exception e) {
            log.warn("MinIO bucket check failed: {}", e.getMessage());
        }
        setPublicReadPolicy();
    }

    private void setPublicReadPolicy() {
        String policy = String.format("""
                {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}
                """, bucketName).strip();
        try {
            s3Client.putBucketPolicy(PutBucketPolicyRequest.builder()
                    .bucket(bucketName)
                    .policy(policy)
                    .build());
            log.info("MinIO bucket '{}' set to public-read", bucketName);
        } catch (Exception e) {
            log.warn("Failed to set bucket policy: {}", e.getMessage());
        }
    }
}
