package com.openblog.repository;

import com.openblog.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, String> {
    Optional<CommentLike> findByUserIdAndCommentId(String userId, String commentId);
    void deleteByUserIdAndCommentId(String userId, String commentId);
    void deleteByCommentId(String commentId);
}
