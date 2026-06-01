package com.myhomepage.domain.comment;

import com.myhomepage.domain.comment.dto.CommentCreateRequest;
import com.myhomepage.domain.comment.dto.CommentResponse;
import com.myhomepage.domain.comment.dto.CommentUpdateRequest;
import com.myhomepage.domain.post.Post;
import com.myhomepage.domain.post.PostRepository;
import com.myhomepage.domain.user.User;
import com.myhomepage.domain.user.UserRepository;
import com.myhomepage.global.error.BusinessException;
import com.myhomepage.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /** 특정 게시글의 댓글 목록 반환 (작성자 JOIN FETCH) */
    public List<CommentResponse> getComments(Long postId) {
        return commentRepository.findByPostIdWithAuthor(postId).stream()
                .map(CommentResponse::from)
                .toList();
    }

    /** 댓글 또는 대댓글 작성 — request.parentId가 있으면 대댓글로 처리 */
    @Transactional
    public CommentResponse createComment(Long postId, CommentCreateRequest request, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Comment parent = null;
        if (request.parentId() != null) {
            parent = commentRepository.findById(request.parentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
        }

        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .content(request.content())
                .parent(parent)
                .build();

        return CommentResponse.from(commentRepository.save(comment));
    }

    /** 댓글 수정 — 작성자 본인만 수정 가능 */
    @Transactional
    public CommentResponse updateComment(Long commentId, CommentUpdateRequest request, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
        if (!comment.isAuthor(userId)) {
            throw new BusinessException(ErrorCode.COMMENT_ACCESS_DENIED);
        }
        comment.update(request.content());
        return CommentResponse.from(comment);
    }

    /** 댓글 삭제 — 작성자 본인만 삭제 가능 */
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
        if (!comment.isAuthor(userId)) {
            throw new BusinessException(ErrorCode.COMMENT_ACCESS_DENIED);
        }
        commentRepository.delete(comment);
    }
}
