package com.openblog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
}

@Repository
interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findByStatusOrderByCreatedAtDesc(String status);
    List<Post> findByAuthorIdOrderByCreatedAtDesc(String authorId);
    int countByAuthorId(String authorId);
}

@Repository
interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByPostIdOrderByCreatedAtAsc(String postId);
}

@Repository
interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByUserIdAndPostId(String userId, String postId);
    void deleteByUserIdAndPostId(String userId, String postId);
    int countByPostId(String postId);
}

@Repository
interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUserIdAndPostId(String userId, String postId);
    void deleteByUserIdAndPostId(String userId, String postId);
}
