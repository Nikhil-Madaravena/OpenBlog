package com.openblog;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> payload) {
        System.out.println("[DB CHECK] Verifying if email exists for signup: " + payload.get("email"));
        if (userRepository.findByEmail(payload.get("email")).isPresent()) {
            System.out.println("[DB RESULT] Email already exists! Rejecting signup.");
            return ResponseEntity.status(409).body(Map.of("error", "Email already taken"));
        }
        System.out.println("[DB RESULT] Email is unique. Encrypting password and saving to PostgreSQL...");
        
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setName(payload.get("name"));
        user.setEmail(payload.get("email"));
        user.setPasswordHash(passwordEncoder.encode(payload.get("password")));
        user.setAvatar("https://api.dicebear.com/7.x/initials/svg?seed=" + payload.get("name").replace(" ", ""));
        user.setBio("");
        user.setJoinedAt(LocalDateTime.now().toString().split("T")[0]);
        user.setCreatedAt(LocalDateTime.now().toString());
        
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        
        Map<String, Object> responseUser = new HashMap<>();
        responseUser.put("id", user.getId());
        responseUser.put("name", user.getName());
        responseUser.put("email", user.getEmail());
        responseUser.put("avatar", user.getAvatar());
        responseUser.put("bio", user.getBio());
        responseUser.put("joinedAt", user.getJoinedAt());
        responseUser.put("postsCount", 0);
        responseUser.put("followersCount", 0);
        responseUser.put("followingCount", 0);
        
        return ResponseEntity.status(201).body(Map.of("token", token, "user", responseUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        System.out.println("[DB CHECK] Attempting login. Querying PostgreSQL for user: " + payload.get("email"));
        Optional<User> optionalUser = userRepository.findByEmail(payload.get("email"));
        
        if (optionalUser.isEmpty()) {
            System.out.println("[DB RESULT] Login failed: User not found in database.");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
        
        System.out.println("[DB CHECK] User found. Verifying encrypted password hash securely...");
        if (!passwordEncoder.matches(payload.get("password"), optionalUser.get().getPasswordHash())) {
            System.out.println("[DB RESULT] Login failed: Password hash does not match.");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
        
        System.out.println("[DB RESULT] Login successful! Passwords match. Generating JWT Token.");
        
        User user = optionalUser.get();
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        
        Map<String, Object> responseUser = new HashMap<>();
        responseUser.put("id", user.getId());
        responseUser.put("name", user.getName());
        responseUser.put("email", user.getEmail());
        responseUser.put("avatar", user.getAvatar());
        responseUser.put("bio", user.getBio());
        responseUser.put("joinedAt", user.getJoinedAt());
        responseUser.put("postsCount", 0);
        responseUser.put("followersCount", 0);
        responseUser.put("followingCount", 0);
        
        return ResponseEntity.ok(Map.of("token", token, "user", responseUser));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        try {
            String token = authHeader.substring(7);
            String userId = jwtUtil.extractUserId(token);
            Optional<User> optionalUser = userRepository.findById(userId);
            if (optionalUser.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            
            User user = optionalUser.get();
            Map<String, Object> responseUser = new HashMap<>();
            responseUser.put("id", user.getId());
            responseUser.put("name", user.getName());
            responseUser.put("email", user.getEmail());
            responseUser.put("avatar", user.getAvatar());
            responseUser.put("bio", user.getBio());
            responseUser.put("joinedAt", user.getJoinedAt());
            responseUser.put("postsCount", 0);
            responseUser.put("followersCount", 0);
            responseUser.put("followingCount", 0);
            return ResponseEntity.ok(responseUser);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }
}

@RestController
@RequestMapping("/api/me")
class MeController {
    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;
    
    @PutMapping
    public ResponseEntity<?> updateMe(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String, String> payload) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        try {
            String token = authHeader.substring(7);
            String userId = jwtUtil.extractUserId(token);
            Optional<User> optionalUser = userRepository.findById(userId);
            if (optionalUser.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            
            User user = optionalUser.get();
            if (payload.containsKey("name")) user.setName(payload.get("name"));
            if (payload.containsKey("avatar")) user.setAvatar(payload.get("avatar"));
            if (payload.containsKey("bio")) user.setBio(payload.get("bio"));
            userRepository.save(user);
            
            Map<String, Object> responseUser = new HashMap<>();
            responseUser.put("id", user.getId());
            responseUser.put("name", user.getName());
            responseUser.put("email", user.getEmail());
            responseUser.put("avatar", user.getAvatar());
            responseUser.put("bio", user.getBio());
            responseUser.put("joinedAt", user.getJoinedAt());
            return ResponseEntity.ok(responseUser);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }
}

@RestController
@RequestMapping("/api/posts")
class PostController {

    @Autowired private PostRepository postRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;
    
    private ObjectMapper mapper = new ObjectMapper();

    private Map<String, Object> formatPost(Post post) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", post.getId());
        map.put("title", post.getTitle());
        map.put("excerpt", post.getExcerpt());
        map.put("content", post.getContent());
        map.put("coverImage", post.getCoverImage());
        
        Map<String, Object> authorMap = new HashMap<>();
        if (post.getAuthor() != null) {
            authorMap.put("id", post.getAuthor().getId());
            authorMap.put("name", post.getAuthor().getName());
            authorMap.put("avatar", post.getAuthor().getAvatar());
        } else {
            authorMap.put("id", "");
            authorMap.put("name", "Unknown");
            authorMap.put("avatar", "https://api.dicebear.com/7.x/initials/svg?seed=U");
        }
        map.put("author", authorMap);
        
        List<String> tagsList = new ArrayList<>();
        try {
            if (post.getTags() != null && !post.getTags().isEmpty() && !post.getTags().equals("null")) {
                if(post.getTags().startsWith("[")) {
                     tagsList = mapper.readValue(post.getTags(), new TypeReference<List<String>>(){});
                } else {
                     tagsList.add(post.getTags());
                }
            }
        } catch (Exception e) {}
        map.put("tags", tagsList);
        
        map.put("status", post.getStatus());
        map.put("views", post.getViews() != null ? post.getViews() : 0);
        map.put("readTime", post.getReadTime() != null ? post.getReadTime() : 1);
        map.put("createdAt", post.getCreatedAt());
        map.put("updatedAt", post.getUpdatedAt());
        map.put("likesCount", 0);
        map.put("isLiked", false);
        map.put("isBookmarked", false);
        return map;
    }

    private String getUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try { return jwtUtil.extractUserId(authHeader.substring(7)); } catch (Exception e) {}
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getPosts() {
        List<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc("published");
        List<Map<String, Object>> result = new ArrayList<>();
        for (Post p : posts) result.add(formatPost(p));
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/mine")
    public ResponseEntity<?> getMyPosts(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = getUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).build();
        List<Post> posts = postRepository.findByAuthorIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Post p : posts) result.add(formatPost(p));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPost(@PathVariable String id) {
        Optional<Post> post = postRepository.findById(id);
        if (post.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Post not found"));
        return ResponseEntity.ok(formatPost(post.get()));
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String, Object> payload) {
        String userId = getUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).build();
        
        Optional<User> author = userRepository.findById(userId);
        if (author.isEmpty()) return ResponseEntity.status(401).build();
        
        Post post = new Post();
        post.setId(UUID.randomUUID().toString());
        post.setTitle((String) payload.get("title"));
        post.setExcerpt((String) payload.get("excerpt"));
        post.setContent((String) payload.get("content"));
        post.setCoverImage((String) payload.get("coverImage"));
        
        Object tagsObj = payload.get("tags");
        try {
            post.setTags(tagsObj != null ? mapper.writeValueAsString(tagsObj) : "[]");
        } catch (Exception e) { post.setTags("[]"); }
        
        String status = (String) payload.get("status");
        post.setStatus(status != null ? status : "published");
        post.setAuthor(author.get());
        post.setCreatedAt(LocalDateTime.now().toString());
        post.setUpdatedAt(LocalDateTime.now().toString());
        post.setViews(0);
        post.setReadTime(1);
        
        postRepository.save(post);
        return ResponseEntity.status(201).body(formatPost(post));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String, Object> payload) {
        String userId = getUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).build();
        
        Optional<Post> optPost = postRepository.findById(id);
        if (optPost.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Post not found"));
        Post post = optPost.get();
        if (post.getAuthor() == null || !post.getAuthor().getId().equals(userId)) {
             return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }
        
        if (payload.containsKey("title")) post.setTitle((String) payload.get("title"));
        if (payload.containsKey("excerpt")) post.setExcerpt((String) payload.get("excerpt"));
        if (payload.containsKey("content")) post.setContent((String) payload.get("content"));
        if (payload.containsKey("coverImage")) post.setCoverImage((String) payload.get("coverImage"));
        if (payload.containsKey("status")) post.setStatus((String) payload.get("status"));
        if (payload.containsKey("tags")) {
            try { post.setTags(mapper.writeValueAsString(payload.get("tags"))); } catch (Exception e) { }
        }
        post.setUpdatedAt(LocalDateTime.now().toString());
        postRepository.save(post);
        return ResponseEntity.ok(formatPost(post));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = getUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).build();
        Optional<Post> optPost = postRepository.findById(id);
        if (optPost.isPresent() && optPost.get().getAuthor() != null && optPost.get().getAuthor().getId().equals(userId)) {
            postRepository.deleteById(id);
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> viewPost(@PathVariable String id) {
        Optional<Post> p = postRepository.findById(id);
        if (p.isPresent()) {
             Post post = p.get();
             post.setViews((post.getViews() == null ? 0 : post.getViews()) + 1);
             postRepository.save(post);
             return ResponseEntity.ok(Map.of("views", post.getViews()));
        }
        return ResponseEntity.status(404).build();
    }
    
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("liked", true));
    }
    
    @PostMapping("/{id}/bookmark")
    public ResponseEntity<?> bookmarkPost(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("bookmarked", true));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable String id) {
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(id);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Comment c : comments) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("postId", c.getPost() != null ? c.getPost().getId() : id);
            map.put("content", c.getContent());
            map.put("createdAt", c.getCreatedAt());
            map.put("likes", c.getLikes());
            map.put("replies", new ArrayList<>());
            if (c.getAuthor() != null) {
                map.put("authorId", c.getAuthor().getId());
                map.put("authorName", c.getAuthor().getName());
                map.put("authorAvatar", c.getAuthor().getAvatar());
            }
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> createComment(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String, String> payload) {
        String userId = getUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).build();
        Optional<User> author = userRepository.findById(userId);
        Optional<Post> post = postRepository.findById(id);
        if (author.isEmpty() || post.isEmpty()) return ResponseEntity.status(404).build();
        
        Comment comment = new Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setContent(payload.get("content"));
        comment.setCreatedAt(LocalDateTime.now().toString());
        comment.setAuthor(author.get());
        comment.setPost(post.get());
        comment.setLikes(0);
        commentRepository.save(comment);
        
        Map<String, Object> map = new HashMap<>();
        map.put("id", comment.getId());
        map.put("postId", id);
        map.put("content", comment.getContent());
        map.put("createdAt", comment.getCreatedAt());
        map.put("likes", 0);
        map.put("replies", new ArrayList<>());
        map.put("authorId", author.get().getId());
        map.put("authorName", author.get().getName());
        map.put("authorAvatar", author.get().getAvatar());
        
        return ResponseEntity.status(201).body(map);
    }
}
