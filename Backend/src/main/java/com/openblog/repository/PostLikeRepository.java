package com.openblog.repository;

import com.openblog.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, String> {
    Optional<PostLike> findByUserIdAndPostId(String userId, String postId);
    long countByPostId(String postId);
    List<PostLike> findByUserId(String userId);
    void deleteByUserIdAndPostId(String userId, String postId);
    void deleteByPostId(String postId);
}
