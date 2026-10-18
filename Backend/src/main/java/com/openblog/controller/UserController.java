package com.openblog.controller;

import com.openblog.entity.Follow;
import com.openblog.entity.User;
import com.openblog.repository.FollowRepository;
import com.openblog.repository.PostRepository;
import com.openblog.repository.UserRepository;
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
@RequestMapping("/api/users")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private FollowRepository followRepository;
    @Autowired private PostRepository postRepository;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String q) {
        List<User> users = (q == null || q.isBlank())
                ? userRepository.findAll()
                : userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q);

        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : users) {
            if (u.isPublicProfile()) result.add(Mappers.userProfile(u, followRepository, postRepository, false));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (!user.isPublicProfile() && !id.equals(SecurityUtils.currentUserId())) {
            throw ApiException.notFound("User not found");
        }
        return ResponseEntity.ok(Mappers.userProfile(user, followRepository, postRepository, false));
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<?> follow(@PathVariable String id) {
        String currentUserId = requireAuth();
        if (currentUserId.equals(id)) throw ApiException.badRequest("You cannot follow yourself");
        User target = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));

        if (followRepository.findByFollowerIdAndFollowingId(currentUserId, id).isEmpty()) {
            Follow follow = new Follow();
            follow.setId(UUID.randomUUID().toString());
            follow.setFollower(userRepository.getReferenceById(currentUserId));
            follow.setFollowing(target);
            follow.setCreatedAt(LocalDateTime.now().toString());
            followRepository.save(follow);
        }

        return ResponseEntity.ok(Map.of("following", true, "followersCount", followRepository.countByFollowingId(id)));
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<?> unfollow(@PathVariable String id) {
        String currentUserId = requireAuth();
        followRepository.deleteByFollowerIdAndFollowingId(currentUserId, id);
        return ResponseEntity.ok(Map.of("following", false, "followersCount", followRepository.countByFollowingId(id)));
    }

    @GetMapping("/{id}/followers")
    @Transactional(readOnly = true)
    public ResponseEntity<?> followers(@PathVariable String id) {
        userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Follow f : followRepository.findByFollowingId(id)) {
            if (f.getFollower() != null) result.add(Mappers.userProfile(f.getFollower(), followRepository, postRepository, false));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/following")
    @Transactional(readOnly = true)
    public ResponseEntity<?> following(@PathVariable String id) {
        userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Follow f : followRepository.findByFollowerId(id)) {
            if (f.getFollowing() != null) result.add(Mappers.userProfile(f.getFollowing(), followRepository, postRepository, false));
        }
        return ResponseEntity.ok(result);
    }

    private String requireAuth() {
        String userId = SecurityUtils.currentUserId();
        if (userId == null) throw ApiException.unauthorized("Unauthorized");
        return userId;
    }
}
