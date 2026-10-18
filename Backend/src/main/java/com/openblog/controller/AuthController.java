package com.openblog.controller;

import com.openblog.entity.Role;
import com.openblog.entity.User;
import com.openblog.repository.FollowRepository;
import com.openblog.repository.PostRepository;
import com.openblog.repository.UserRepository;
import com.openblog.security.JwtUtil;
import com.openblog.security.SecurityUtils;
import com.openblog.util.ApiException;
import com.openblog.util.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private FollowRepository followRepository;
    @Autowired private PostRepository postRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");

        if (name == null || name.isBlank()) throw ApiException.badRequest("Name is required");
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) throw ApiException.badRequest("A valid email is required");
        if (password == null || password.length() < 4) throw ApiException.badRequest("Password must be at least 4 characters");

        if (userRepository.findByEmail(email).isPresent()) {
            throw ApiException.conflict("Email already taken");
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setName(name.trim());
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setAvatar("https://api.dicebear.com/7.x/initials/svg?seed=" + name.replace(" ", ""));
        user.setBio("");
        user.setJoinedAt(LocalDateTime.now().toString().split("T")[0]);
        user.setCreatedAt(LocalDateTime.now().toString());
        user.setRole(Role.USER);

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return ResponseEntity.status(201).body(Map.of("token", token, "user", Mappers.userProfile(user, followRepository, postRepository, true)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        if (email == null || password == null) throw ApiException.badRequest("Email and password are required");

        Optional<User> optionalUser = userRepository.findByEmail(email.trim().toLowerCase());
        if (optionalUser.isEmpty() || !passwordEncoder.matches(password, optionalUser.get().getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password");
        }

        User user = optionalUser.get();
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(Map.of("token", token, "user", Mappers.userProfile(user, followRepository, postRepository, true)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        String userId = SecurityUtils.currentUserId();
        if (userId == null) throw ApiException.unauthorized("Unauthorized");
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        return ResponseEntity.ok(Mappers.userProfile(user, followRepository, postRepository, true));
    }
}
