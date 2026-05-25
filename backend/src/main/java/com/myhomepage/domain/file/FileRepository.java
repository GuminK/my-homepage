package com.myhomepage.domain.file;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FileRepository extends JpaRepository<FileInfo, Long> {
    List<FileInfo> findAllByPostId(Long postId);
}
