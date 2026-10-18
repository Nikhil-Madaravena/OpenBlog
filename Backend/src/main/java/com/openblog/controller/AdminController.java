package com.openblog.controller;

import com.openblog.entity.Role;
import com.openblog.entity.User;
import com.openblog.repository.*;
import com.openblog.security.SecurityUtils;
import com.openblog.util.ApiException;
import com.openblog.util.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Admin-only endpoints. Access is enforced declaratively in SecurityConfiguration
 * via `.requestMatchers("/api/admin/**").hasRole("ADMIN")`, backed by the ROLE_*
 * authority JwtAuthenticationFilter attaches from the token's "role" claim.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private PostLikeRepository postLikeRepository;
    @Autowired private BookmarkRepository bookmarkRepository;
    @Autowired private FollowRepository followRepository;

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            Map<String, Object> map = Mappers.userProfile(u, followRepository, postRepository, true);
            map.put("totalPosts", postRepository.countByAuthorId(u.getId()));
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String currentUserId = SecurityUtils.currentUserId();
        if (id.equals(currentUserId)) throw ApiException.badRequest("You cannot change your own role");

        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        String roleStr = payload.get("role");
        Role role;
        try {
            role = Role.valueOf(roleStr);
        } catch (Exception e) {
            throw ApiException.badRequest("Role must be USER or ADMIN");
        }
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(Mappers.userProfile(user, followRepository, postRepository, true));
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        String currentUserId = SecurityUtils.currentUserId();
        if (id.equals(currentUserId)) throw ApiException.badRequest("You cannot delete your own account");

        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        for (var p : postRepository.findByAuthorIdOrderByCreatedAtDesc(id)) {
            commentRepository.deleteByPostId(p.getId());
            postLikeRepository.deleteByPostId(p.getId());
            bookmarkRepository.deleteByPostId(p.getId());
        }
        postRepository.deleteAll(postRepository.findByAuthorIdOrderByCreatedAtDesc(id));
        for (var f : followRepository.findByFollowerId(id)) followRepository.deleteById(f.getId());
        for (var f : followRepository.findByFollowingId(id)) followRepository.deleteById(f.getId());
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/posts/{id}")
    @Transactional
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        postRepository.findById(id).orElseThrow(() -> ApiException.notFound("Post not found"));
        commentRepository.deleteByPostId(id);
        postLikeRepository.deleteByPostId(id);
        bookmarkRepository.deleteByPostId(id);
        postRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> platformStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalAdmins", userRepository.countByRole(Role.ADMIN));
        stats.put("totalPosts", postRepository.count());
        stats.put("publishedPosts", postRepository.countByStatus("published"));
        stats.put("draftPosts", postRepository.countByStatus("draft"));
        stats.put("totalComments", commentRepository.count());
        stats.put("totalLikes", postLikeRepository.count());
        stats.put("totalFollows", followRepository.count());
        return ResponseEntity.ok(stats);
    }
}
