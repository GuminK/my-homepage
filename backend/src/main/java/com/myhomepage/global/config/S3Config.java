package com.myhomepage.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
public class S3Config {

    @Value("${storage.minio.endpoint:}")
    private String minioEndpoint;

    @Value("${storage.minio.access-key:}")
    private String minioAccessKey;

    @Value("${storage.minio.secret-key:}")
    private String minioSecretKey;

    @Value("${storage.s3.region:ap-northeast-2}")
    private String region;

    @Bean
    public S3Client s3Client() {
        if (minioEndpoint != null && !minioEndpoint.isBlank()) {
            // 로컬 MinIO
            return S3Client.builder()
                    .endpointOverride(URI.create(minioEndpoint))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(minioAccessKey, minioSecretKey)))
                    .region(Region.US_EAST_1)
                    .forcePathStyle(true)
                    .build();
        }
        // AWS S3 (환경변수 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY 자동 사용)
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
