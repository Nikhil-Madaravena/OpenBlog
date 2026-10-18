package com.openblog.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_posts_status", columnList = "status"),
        @Index(name = "idx_posts_author", columnList = "author_id")
})
public class Post {

    @Id
    private String id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String coverImage;

    // LAZY: author is only loaded when explicitly needed/fetched (see PostRepository JOIN FETCH queries
    // used for list endpoints) instead of being eagerly pulled on every query -> avoids N+1 / over-fetching.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    private String tags;
    private String status;
    private Integer views = 0;
    private Integer readTime = 1;
    private String createdAt;
    private String updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }
    public Integer getReadTime() { return readTime; }
    public void setReadTime(Integer readTime) { this.readTime = readTime; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
