package com.openblog.controller;

import com.openblog.entity.*;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired private PostRepository postRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PostLikeRepository postLikeRepository;
    @Autowired private BookmarkRepository bookmarkRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getPosts(@RequestParam(required = false) String q, @RequestParam(required = false) String tag) {
        String currentUserId = SecurityUtils.currentUserId();
        List<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc("published");

        if (q != null && !q.isBlank()) {
            String needle = q.toLowerCase();
            posts = posts.stream()
                    .filter(p -> (p.getTitle() != null && p.getTitle().toLowerCase().contains(needle))
                            || (p.getExcerpt() != null && p.getExcerpt().toLowerCase().contains(needle)))
                    .collect(Collectors.toList());
        }
        if (tag != null && !tag.isBlank()) {
            posts = posts.stream()
                    .filter(p -> Mappers.parseTags(p.getTags()).stream().anyMatch(t -> t.equalsIgnoreCase(tag)))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Post p : posts) result.add(Mappers.postResponse(p, postLikeRepository, bookmarkRepository, commentRepository, currentUserId));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/mine")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyPosts() {
        String userId = requireAuth();
        List<Post> posts = postRepository.findByAuthorIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Post p : posts) result.add(Mappers.postResponse(p, postLikeRepository, bookmarkRepository, commentRepository, userId));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getPost(@PathVariable String id) {
        Post post = postRepository.findByIdFetchAuthor(id).orElseThrow(() -> ApiException.notFound("Post not found"));
        String currentUserId = SecurityUtils.currentUserId();

        boolean isOwner = post.getAuthor() != null && post.getAuthor().getId().equals(currentUserId);
        if (!"published".equals(post.getStatus()) && !isOwner && !SecurityUtils.isAdmin()) {
            throw ApiException.notFound("Post not found");
        }
        return ResponseEntity.ok(Mappers.postResponse(post, postLikeRepository, bookmarkRepository, commentRepository, currentUserId));
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Map<String, Object> payload) {
        String userId = requireAuth();
        User author = userRepository.findById(userId).orElseThrow(() -> ApiException.unauthorized("Unauthorized"));

        String title = (String) payload.get("title");
        String content = (String) payload.get("content");
        if (title == null || title.isBlank()) throw ApiException.badRequest("Title is required");
        if (content == null || content.isBlank()) throw ApiException.badRequest("Content is required");

        Post post = new Post();
        post.setId(UUID.randomUUID().toString());
        post.setTitle(title);
        post.setExcerpt((String) payload.get("excerpt"));
        post.setContent(content);
        post.setCoverImage((String) payload.get("coverImage"));
        post.setTags(Mappers.writeTags(payload.get("tags")));

        String status = (String) payload.get("status");
        post.setStatus(status != null ? status : "published");
        post.setAuthor(author);
        post.setCreatedAt(LocalDateTime.now().toString());
        post.setUpdatedAt(LocalDateTime.now().toString());
        post.setViews(0);
        post.setReadTime(Mappers.computeReadTime(content));

        postRepository.save(post);
        return ResponseEntity.status(201).body(Mappers.postResponse(post, postLikeRepository, bookmarkRepository, commentRepository, userId));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updatePost(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        String userId = requireAuth();
        Post post = postRepository.findByIdFetchAuthor(id).orElseThrow(() -> ApiException.notFound("Post not found"));
        requireOwnerOrAdmin(post, userId);

        if (payload.containsKey("title")) post.setTitle((String) payload.get("title"));
        if (payload.containsKey("excerpt")) post.setExcerpt((String) payload.get("excerpt"));
        if (payload.containsKey("content")) {
            post.setContent((String) payload.get("content"));
            post.setReadTime(Mappers.computeReadTime((String) payload.get("content")));
        }
        if (payload.containsKey("coverImage")) post.setCoverImage((String) payload.get("coverImage"));
        if (payload.containsKey("status")) post.setStatus((String) payload.get("status"));
        if (payload.containsKey("tags")) post.setTags(Mappers.writeTags(payload.get("tags")));
        post.setUpdatedAt(LocalDateTime.now().toString());
        postRepository.save(post);
        return ResponseEntity.ok(Mappers.postResponse(post, postLikeRepository, bookmarkRepository, commentRepository, userId));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        String userId = requireAuth();
        Post post = postRepository.findById(id).orElseThrow(() -> ApiException.notFound("Post not found"));
        requireOwnerOrAdmin(post, userId);

        commentRepository.deleteByPostId(id);
        postLikeRepository.deleteByPostId(id);
        bookmarkRepository.deleteByPostId(id);
        postRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> viewPost(@PathVariable String id) {
        Post post = postRepository.findById(id).orElseThrow(() -> ApiException.notFound("Post not found"));
        post.setViews((post.getViews() == null ? 0 : post.getViews()) + 1);
        postRepository.save(post);
        return ResponseEntity.ok(Map.of("views", post.getViews()));
    }

    @PostMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> likePost(@PathVariable String id) {
        String userId = requireAuth();
        postRepository.findById(id).orElseThrow(() -> ApiException.notFound("Post not found"));

        boolean liked;
        Optional<PostLike> existing = postLikeRepository.findByUserIdAndPostId(userId, id);
        if (existing.isPresent()) {
            postLikeRepository.deleteById(existing.get().getId());
            liked = false;
        } else {
            PostLike like = new PostLike();
            like.setId(UUID.randomUUID().toString());
            like.setUser(userRepository.getReferenceById(userId));
            like.setPost(postRepository.getReferenceById(id));
            like.setCreatedAt(LocalDateTime.now().toString());
            postLikeRepository.save(like);
            liked = true;
        }
        return ResponseEntity.ok(Map.of("liked", liked, "likesCount", postLikeRepository.countByPostId(id)));
    }

    @PostMapping("/{id}/bookmark")
    @Transactional
    public ResponseEntity<?> bookmarkPost(@PathVariable String id) {
        String userId = requireAuth();
        postRepository.findById(id).orElseThrow(() -> ApiException.notFound("Post not found"));

        boolean bookmarked;
        Optional<Bookmark> existing = bookmarkRepository.findByUserIdAndPostId(userId, id);
        if (existing.isPresent()) {
            bookmarkRepository.deleteById(existing.get().getId());
            bookmarked = false;
        } else {
            Bookmark bookmark = new Bookmark();
            bookmark.setId(UUID.randomUUID().toString());
            bookmark.setUser(userRepository.getReferenceById(userId));
            bookmark.setPost(postRepository.getReferenceById(id));
            bookmark.setCreatedAt(LocalDateTime.now().toString());
            bookmarkRepository.save(bookmark);
            bookmarked = true;
        }
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }

    @GetMapping("/{id}/related")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getRelated(@PathVariable String id) {
        Post post = postRepository.findById(id).orElseThrow(() -> ApiException.notFound("Post not found"));
        List<String> tags = Mappers.parseTags(post.getTags());
        String currentUserId = SecurityUtils.currentUserId();

        List<Post> related = postRepository.findRelated("published", id).stream()
                .filter(p -> Mappers.parseTags(p.getTags()).stream().anyMatch(tags::contains))
                .limit(4)
                .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        for (Post p : related) result.add(Mappers.postResponse(p, postLikeRepository, bookmarkRepository, commentRepository, currentUserId));
        return ResponseEntity.ok(result);
    }

    private String requireAuth() {
        String userId = SecurityUtils.currentUserId();
        if (userId == null) throw ApiException.unauthorized("Unauthorized");
        return userId;
    }

    private void requireOwnerOrAdmin(Post post, String userId) {
        boolean isOwner = post.getAuthor() != null && post.getAuthor().getId().equals(userId);
        if (!isOwner && !SecurityUtils.isAdmin()) throw ApiException.forbidden("Not authorized");
    }
}
