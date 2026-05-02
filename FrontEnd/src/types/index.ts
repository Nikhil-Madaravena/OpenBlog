// Extended types for the blog platform

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  tags: string[];
  status: "published" | "draft" | "archived" | "scheduled";
  views: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinedAt: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: "like" | "comment" | "follow" | "mention";
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

export interface BlogStats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageReadTime: number;
}
