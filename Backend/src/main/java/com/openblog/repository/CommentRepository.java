package com.openblog.repository;

import com.openblog.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {

    // LEFT JOIN FETCH avoids one lazy-load query per comment author when building the nested tree.
    @Query("select c from Comment c left join fetch c.author where c.post.id = :postId order by c.createdAt asc")
    List<Comment> findByPostIdOrderByCreatedAtAsc(String postId);

    List<Comment> findByParentIdOrderByCreatedAtAsc(String parentId);
    long countByPostId(String postId);
    void deleteByPostId(String postId);
}
