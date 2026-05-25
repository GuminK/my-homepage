package com.myhomepage.domain.file;

import com.myhomepage.domain.post.Post;
import com.myhomepage.domain.user.User;
import com.myhomepage.global.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "file_info")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FileInfo extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @Column(nullable = false)
    private String originalName;

    @Column(nullable = false)
    private String storedName;  // UUID 기반 저장명

    @Column(nullable = false)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileType fileType;

    private long fileSize;  // bytes

    @Builder
    public FileInfo(Post post, User uploader, String originalName, String storedName,
                    String fileUrl, FileType fileType, long fileSize) {
        this.post = post;
        this.uploader = uploader;
        this.originalName = originalName;
        this.storedName = storedName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }

    public void attachToPost(Post post) {
        this.post = post;
    }
}
