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

import java.util.*;

@RestController
@RequestMapping("/api/me")
public class MeController {

    @Autowired private UserRepository userRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private PostLikeRepository postLikeRepository;
    @Autowired private BookmarkRepository bookmarkRepository;
    @Autowired private FollowRepository followRepository;

    private User currentUser() {
        String userId = SecurityUtils.currentUserId();
        if (userId == null) throw ApiException.unauthorized("Unauthorized");
        return userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getMe() {
        return ResponseEntity.ok(Mappers.userProfile(currentUser(), followRepository, postRepository, true));
    }

    @PutMapping
    public ResponseEntity<?> updateMe(@RequestBody Map<String, String> payload) {
        User user = currentUser();
        if (payload.containsKey("name")) {
            String name = payload.get("name");
            if (name == null || name.isBlank()) throw ApiException.badRequest("Name cannot be empty");
            user.setName(name.trim());
        }
        if (payload.containsKey("avatar")) user.setAvatar(payload.get("avatar"));
        if (payload.containsKey("bio")) user.setBio(payload.get("bio"));
        userRepository.save(user);
        return ResponseEntity.ok(Mappers.userProfile(user, followRepository, postRepository, true));
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<?> deleteMe() {
        User user = currentUser();
        String userId = user.getId();

        // Clean up everything that references this user before deleting the account.
        for (Post p : postRepository.findByAuthorIdOrderByCreatedAtDesc(userId)) {
            commentRepository.deleteByPostId(p.getId());
            postLikeRepository.deleteByPostId(p.getId());
            bookmarkRepository.deleteByPostId(p.getId());
        }
        postRepository.deleteAll(postRepository.findByAuthorIdOrderByCreatedAtDesc(userId));
        for (PostLike like : postLikeRepository.findByUserId(userId)) postLikeRepository.deleteById(like.getId());
        for (Follow f : followRepository.findByFollowerId(userId)) followRepository.deleteById(f.getId());
        for (Follow f : followRepository.findByFollowingId(userId)) followRepository.deleteById(f.getId());
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/bookmarks")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getBookmarks() {
        User user = currentUser();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Bookmark b : bookmarkRepository.findByUserIdOrderByCreatedAtDesc(user.getId())) {
            if (b.getPost() != null) {
                result.add(Mappers.postResponse(b.getPost(), postLikeRepository, bookmarkRepository, commentRepository, user.getId()));
            }
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/followers")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getFollowers() {
        User user = currentUser();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Follow f : followRepository.findByFollowingId(user.getId())) {
            if (f.getFollower() != null) result.add(Mappers.userProfile(f.getFollower(), followRepository, postRepository, false));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/following")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getFollowing() {
        User user = currentUser();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Follow f : followRepository.findByFollowerId(user.getId())) {
            if (f.getFollowing() != null) result.add(Mappers.userProfile(f.getFollowing(), followRepository, postRepository, false));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getStats() {
        User user = currentUser();
        List<Post> myPosts = postRepository.findByAuthorIdOrderByCreatedAtDesc(user.getId());

        int totalViews = 0, totalComments = 0, totalReadTime = 0;
        long totalLikes = 0;
        int publishedCount = 0, draftCount = 0;

        for (Post p : myPosts) {
            totalViews += p.getViews() != null ? p.getViews() : 0;
            totalReadTime += p.getReadTime() != null ? p.getReadTime() : 1;
            totalComments += commentRepository.countByPostId(p.getId());
            totalLikes += postLikeRepository.countByPostId(p.getId());
            if ("published".equals(p.getStatus())) publishedCount++;
            if ("draft".equals(p.getStatus())) draftCount++;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPosts", myPosts.size());
        stats.put("totalViews", totalViews);
        stats.put("totalLikes", totalLikes);
        stats.put("totalComments", totalComments);
        stats.put("averageReadTime", myPosts.isEmpty() ? 0 : Math.round((double) totalReadTime / myPosts.size()));
        stats.put("publishedCount", publishedCount);
        stats.put("draftCount", draftCount);
        stats.put("followersCount", followRepository.countByFollowingId(user.getId()));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        User user = currentUser();
        Map<String, Object> settings = new HashMap<>();
        settings.put("blogName", user.getBlogName());
        settings.put("emailNotifications", user.isEmailNotifications());
        settings.put("weeklyDigest", user.isWeeklyDigest());
        settings.put("publicProfile", user.isPublicProfile());
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> payload) {
        User user = currentUser();
        if (payload.containsKey("blogName")) user.setBlogName((String) payload.get("blogName"));
        if (payload.containsKey("emailNotifications")) user.setEmailNotifications((Boolean) payload.get("emailNotifications"));
        if (payload.containsKey("weeklyDigest")) user.setWeeklyDigest((Boolean) payload.get("weeklyDigest"));
        if (payload.containsKey("publicProfile")) user.setPublicProfile((Boolean) payload.get("publicProfile"));
        userRepository.save(user);

        Map<String, Object> settings = new HashMap<>();
        settings.put("blogName", user.getBlogName());
        settings.put("emailNotifications", user.isEmailNotifications());
        settings.put("weeklyDigest", user.isWeeklyDigest());
        settings.put("publicProfile", user.isPublicProfile());
        return ResponseEntity.ok(settings);
    }
}
