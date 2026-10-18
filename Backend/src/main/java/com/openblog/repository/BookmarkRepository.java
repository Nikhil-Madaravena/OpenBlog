package com.openblog.repository;

import com.openblog.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, String> {
    Optional<Bookmark> findByUserIdAndPostId(String userId, String postId);
    List<Bookmark> findByUserIdOrderByCreatedAtDesc(String userId);
    void deleteByUserIdAndPostId(String userId, String postId);
    void deleteByPostId(String postId);
}
