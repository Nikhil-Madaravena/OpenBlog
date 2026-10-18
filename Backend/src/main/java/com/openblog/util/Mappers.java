package com.openblog.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openblog.entity.Comment;
import com.openblog.entity.Post;
import com.openblog.entity.User;
import com.openblog.repository.*;

import java.util.*;

/** Shared entity -> response-map converters, kept in one place to avoid duplicating the JSON shape
 *  (which the frontend relies on) across every controller. */
public final class Mappers {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Mappers() {}

    public static List<String> parseTags(String tagsJson) {
        List<String> tagsList = new ArrayList<>();
        try {
            if (tagsJson != null && !tagsJson.isEmpty() && !tagsJson.equals("null")) {
                if (tagsJson.startsWith("[")) {
                    tagsList = MAPPER.readValue(tagsJson, new TypeReference<List<String>>() {});
                } else {
                    tagsList.add(tagsJson);
                }
            }
        } catch (Exception ignored) {}
        return tagsList;
    }

    public static String writeTags(Object tags) {
        try {
            return tags != null ? MAPPER.writeValueAsString(tags) : "[]";
        } catch (Exception e) {
            return "[]";
        }
    }

    public static int computeReadTime(String content) {
        if (content == null || content.isBlank()) return 1;
        int words = content.trim().split("\\s+").length;
        return Math.max(1, (int) Math.ceil(words / 200.0));
    }

    public static Map<String, Object> userSummary(User u) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", u.getId());
        map.put("name", u.getName());
        map.put("avatar", u.getAvatar());
        return map;
    }

    public static Map<String, Object> userProfile(User u, FollowRepository followRepo, PostRepository postRepo, boolean includeEmail) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", u.getId());
        map.put("name", u.getName());
        if (includeEmail) map.put("email", u.getEmail());
        map.put("avatar", u.getAvatar());
        map.put("bio", u.getBio());
        map.put("joinedAt", u.getJoinedAt());
        map.put("role", u.getRole().name());
        map.put("postsCount", postRepo.countByAuthorIdAndStatus(u.getId(), "published"));
        map.put("followersCount", followRepo.countByFollowingId(u.getId()));
        map.put("followingCount", followRepo.countByFollowerId(u.getId()));
        return map;
    }

    public static Map<String, Object> postResponse(Post post, PostLikeRepository likeRepo, BookmarkRepository bookmarkRepo,
                                                     CommentRepository commentRepo, String currentUserId) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", post.getId());
        map.put("title", post.getTitle());
        map.put("excerpt", post.getExcerpt());
        map.put("content", post.getContent());
        map.put("coverImage", post.getCoverImage());

        if (post.getAuthor() != null) {
            map.put("author", userSummary(post.getAuthor()));
        } else {
            Map<String, Object> unknown = new HashMap<>();
            unknown.put("id", "");
            unknown.put("name", "Unknown");
            unknown.put("avatar", "https://api.dicebear.com/7.x/initials/svg?seed=U");
            map.put("author", unknown);
        }

        map.put("tags", parseTags(post.getTags()));
        map.put("status", post.getStatus());
        map.put("views", post.getViews() != null ? post.getViews() : 0);
        map.put("readTime", post.getReadTime() != null ? post.getReadTime() : 1);
        map.put("createdAt", post.getCreatedAt());
        map.put("updatedAt", post.getUpdatedAt());
        map.put("likesCount", likeRepo.countByPostId(post.getId()));
        map.put("commentsCount", commentRepo.countByPostId(post.getId()));
        map.put("isLiked", currentUserId != null && likeRepo.findByUserIdAndPostId(currentUserId, post.getId()).isPresent());
        map.put("isBookmarked", currentUserId != null && bookmarkRepo.findByUserIdAndPostId(currentUserId, post.getId()).isPresent());
        return map;
    }

    public static Map<String, Object> commentFlat(Comment c) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("postId", c.getPost() != null ? c.getPost().getId() : null);
        map.put("parentId", c.getParentId());
        map.put("content", c.getContent());
        map.put("createdAt", c.getCreatedAt());
        map.put("likes", c.getLikes() != null ? c.getLikes() : 0);
        if (c.getAuthor() != null) {
            map.put("authorId", c.getAuthor().getId());
            map.put("authorName", c.getAuthor().getName());
            map.put("authorAvatar", c.getAuthor().getAvatar());
        }
        return map;
    }

    /** Builds the nested reply tree the frontend expects (`replies: Comment[]`) from a flat list. */
    public static List<Map<String, Object>> commentTree(List<Comment> all) {
        Map<String, List<Comment>> byParent = new HashMap<>();
        for (Comment c : all) {
            byParent.computeIfAbsent(c.getParentId(), k -> new ArrayList<>()).add(c);
        }
        List<Comment> roots = byParent.getOrDefault(null, new ArrayList<>());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Comment root : roots) {
            result.add(buildNode(root, byParent));
        }
        return result;
    }

    private static Map<String, Object> buildNode(Comment c, Map<String, List<Comment>> byParent) {
        Map<String, Object> node = commentFlat(c);
        List<Map<String, Object>> replies = new ArrayList<>();
        for (Comment child : byParent.getOrDefault(c.getId(), new ArrayList<>())) {
            replies.add(buildNode(child, byParent));
        }
        node.put("replies", replies);
        return node;
    }
}
