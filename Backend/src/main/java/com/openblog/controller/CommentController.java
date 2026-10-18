package com.openblog.controller;

import com.openblog.entity.Comment;
import com.openblog.entity.CommentLike;
import com.openblog.entity.Post;
import com.openblog.entity.User;
import com.openblog.repository.*;
import com.openblog.security.SecurityUtils;
import com.openblog.util.ApiException;
import com.openblog.util.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    @Autowired private PostRepository postRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CommentLikeRepository commentLikeRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getComments(@PathVariable String postId) {
        postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("Post not found"));
        List<Comment> all = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        return ResponseEntity.ok(Mappers.commentTree(all));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createComment(@PathVariable String postId, @RequestBody Map<String, String> payload) {
        String userId = requireAuth();
        User author = userRepository.findById(userId).orElseThrow(() -> ApiException.unauthorized("Unauthorized"));
        Post post = postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("Post not found"));

        String content = payload.get("content");
        if (content == null || content.isBlank()) throw ApiException.badRequest("Comment content is required");

        String parentId = payload.get("parentId");
        if (parentId != null && !parentId.isBlank()) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> ApiException.notFound("Parent comment not found"));
            if (!parent.getPost().getId().equals(postId)) throw ApiException.badRequest("Parent comment belongs to a different post");
        } else {
            parentId = null;
        }

        Comment comment = new Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now().toString());
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setParentId(parentId);
        comment.setLikes(0);
        commentRepository.save(comment);

        return ResponseEntity.status(201).body(Mappers.commentFlat(comment));
    }

    @DeleteMapping("/{commentId}")
    @Transactional
    public ResponseEntity<?> deleteComment(@PathVariable String postId, @PathVariable String commentId) {
        String userId = requireAuth();
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> ApiException.notFound("Comment not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("Post not found"));

        boolean isCommentAuthor = comment.getAuthor() != null && comment.getAuthor().getId().equals(userId);
        boolean isPostOwner = post.getAuthor() != null && post.getAuthor().getId().equals(userId);
        if (!isCommentAuthor && !isPostOwner && !SecurityUtils.isAdmin()) {
            throw ApiException.forbidden("Not authorized");
        }

        deleteCommentAndReplies(commentId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<?> likeComment(@PathVariable String postId, @PathVariable String commentId) {
        String userId = requireAuth();
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> ApiException.notFound("Comment not found"));

        boolean liked;
        Optional<CommentLike> existing = commentLikeRepository.findByUserIdAndCommentId(userId, commentId);
        if (existing.isPresent()) {
            commentLikeRepository.deleteById(existing.get().getId());
            comment.setLikes(Math.max(0, (comment.getLikes() == null ? 0 : comment.getLikes()) - 1));
            liked = false;
        } else {
            CommentLike like = new CommentLike();
            like.setId(UUID.randomUUID().toString());
            like.setUser(userRepository.getReferenceById(userId));
            like.setComment(comment);
            commentLikeRepository.save(like);
            comment.setLikes((comment.getLikes() == null ? 0 : comment.getLikes()) + 1);
            liked = true;
        }
        commentRepository.save(comment);
        return ResponseEntity.ok(Map.of("likes", comment.getLikes(), "liked", liked));
    }

    private void deleteCommentAndReplies(String commentId) {
        for (Comment reply : commentRepository.findByParentIdOrderByCreatedAtAsc(commentId)) {
            deleteCommentAndReplies(reply.getId());
        }
        commentLikeRepository.deleteByCommentId(commentId);
        commentRepository.deleteById(commentId);
    }

    private String requireAuth() {
        String userId = SecurityUtils.currentUserId();
        if (userId == null) throw ApiException.unauthorized("Unauthorized");
        return userId;
    }
}
