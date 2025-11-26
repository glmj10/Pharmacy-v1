package com.pharmacy_backend.file_service.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class MinioConfig {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.auto-create-bucket}")
    private boolean autoCreateBucket;



    @Bean
    public MinioClient minioClient() {
        MinioClient client = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();

        if (autoCreateBucket) {
            try {
                boolean exists = client.bucketExists(BucketExistsArgs.builder()
                        .bucket(bucket)
                        .build());
                if (!exists) {
                    client.makeBucket(MakeBucketArgs.builder()
                            .bucket(bucket)
                            .build());
                }
            } catch (Exception e) {
                throw new RuntimeException("Không thể khởi tạo bucket MinIO: " + bucket, e);
            }
        }
        return client;
    }

}
