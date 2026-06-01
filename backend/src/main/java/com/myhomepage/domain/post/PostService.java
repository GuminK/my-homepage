package com.myhomepage.domain.post;

import com.myhomepage.domain.file.FileInfo;
import com.myhomepage.domain.file.FileRepository;
import com.myhomepage.domain.post.dto.PostCreateRequest;
import com.myhomepage.domain.post.dto.PostResponse;
import com.myhomepage.domain.user.User;
import com.myhomepage.domain.user.UserRepository;
import com.myhomepage.global.error.BusinessException;
import com.myhomepage.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FileRepository fileRepository;

    /** 게시글 목록을 최신순으로 페이지네이션하여 반환 */
    public Page<PostResponse> getPosts(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(PostResponse::from);
    }

    /** 게시글 단건 조회 및 조회수 증가 (author, attachments JOIN FETCH로 N+1 방지) */
    @Transactional
    public PostResponse getPost(Long postId) {
        Post post = postRepository.findByIdWithDetails(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        post.increaseViewCount();
        return PostResponse.from(post);
    }

    /** 게시글 작성 — fileIds가 있으면 이미 업로드된 파일을 게시글에 연결 */
    @Transactional
    public PostResponse createPost(PostCreateRequest request, Long userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Post post = Post.builder()
                .author(author)
                .title(request.title())
                .content(request.content())
                .build();
        postRepository.save(post);

        if (request.fileIds() != null && !request.fileIds().isEmpty()) {
            List<FileInfo> files = fileRepository.findAllById(request.fileIds());
            files.forEach(f -> f.attachToPost(post));
        }

        return PostResponse.from(post);
    }

    /** 게시글 수정 — 작성자 본인만 수정 가능 */
    @Transactional
    public PostResponse updatePost(Long postId, PostCreateRequest request, Long userId) {
        Post post = postRepository.findByIdWithAuthor(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (!post.isAuthor(userId)) {
            throw new BusinessException(ErrorCode.POST_ACCESS_DENIED);
        }

        post.update(request.title(), request.content());
        return PostResponse.from(post);
    }

    /** 게시글 삭제 — 작성자 본인만 삭제 가능 */
    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findByIdWithAuthor(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (!post.isAuthor(userId)) {
            throw new BusinessException(ErrorCode.POST_ACCESS_DENIED);
        }

        postRepository.delete(post);
    }
}
