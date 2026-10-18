package com.openblog.repository;

import com.openblog.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {

    // LEFT JOIN FETCH pulls the (otherwise LAZY) author in the same query, avoiding N+1 selects
    // when the list is serialized for the response - the main query-optimization lever here.
    // LEFT (not inner) join keeps posts whose author was deleted from disappearing entirely.
    @Query("select p from Post p left join fetch p.author where p.status = :status order by p.createdAt desc")
    List<Post> findByStatusOrderByCreatedAtDesc(String status);

    @Query("select p from Post p left join fetch p.author where p.author.id = :authorId order by p.createdAt desc")
    List<Post> findByAuthorIdOrderByCreatedAtDesc(String authorId);

    @Query("select p from Post p left join fetch p.author where p.status = :status and p.id <> :excludeId order by p.createdAt desc")
    List<Post> findRelated(String status, String excludeId);

    @Query("select p from Post p left join fetch p.author where p.id = :id")
    java.util.Optional<Post> findByIdFetchAuthor(String id);

    long countByAuthorId(String authorId);
    long countByAuthorIdAndStatus(String authorId, String status);
    long countByStatus(String status);
}
