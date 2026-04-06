import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { mockPosts, type BlogPost } from "@/data/mockData";
import { useAuth } from "./AuthContext";

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

interface BlogContextType {
  posts: BlogPost[];
  getPost: (id: string) => BlogPost | undefined;
  getPublishedPosts: () => BlogPost[];
  getMyPosts: () => BlogPost[];
  createPost: (post: Omit<BlogPost, "id" | "author" | "views" | "readTime" | "createdAt" | "updatedAt">) => BlogPost;
  updatePost: (id: string, updates: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  likePost: (id: string) => void;
  bookmarkPost: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  isLiked: (id: string) => boolean;
  bookmarkedPosts: string[];
  likedPosts: string[];
  // Comments
  getComments: (postId: string) => Comment[];
  addComment: (postId: string, content: string) => Comment;
  deleteComment: (postId: string, commentId: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  getRelatedPosts: (postId: string) => BlogPost[];
  incrementView: (postId: string) => void;
}

const BlogContext = createContext<BlogContextType | null>(null);

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem("openblog_posts");
    return saved ? JSON.parse(saved) : mockPosts;
  });

  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>(() => {
    const saved = localStorage.getItem("openblog_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  const [likedPosts, setLikedPosts] = useState<string[]>(() => {
    const saved = localStorage.getItem("openblog_likes");
    return saved ? JSON.parse(saved) : [];
  });

  const [comments, setComments] = useState<Record<string, Comment[]>>(() => {
    const saved = localStorage.getItem("openblog_comments");
    return saved ? JSON.parse(saved) : {};
  });

  const savePosts = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    localStorage.setItem("openblog_posts", JSON.stringify(newPosts));
  };

  const saveComments = (newComments: Record<string, Comment[]>) => {
    setComments(newComments);
    localStorage.setItem("openblog_comments", JSON.stringify(newComments));
  };

  const getPost = useCallback((id: string) => posts.find((p) => p.id === id), [posts]);

  const getPublishedPosts = useCallback(() => posts.filter((p) => p.status === "published"), [posts]);

  const getMyPosts = useCallback(() => {
    if (!user) return [];
    return posts.filter((p) => p.author.id === user.id);
  }, [posts, user]);

  const createPost = useCallback((data: Omit<BlogPost, "id" | "author" | "views" | "readTime" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString().split("T")[0];
    const wordCount = data.content.split(/\s+/).length;
    const newPost: BlogPost = {
      ...data,
      id: `post_${Date.now()}`,
      author: {
        id: user?.id || "anon",
        name: user?.name || "Anonymous",
        avatar: user?.avatar || "",
      },
      views: 0,
      readTime: Math.max(1, Math.ceil(wordCount / 200)),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newPost, ...posts];
    savePosts(updated);
    return newPost;
  }, [posts, user]);

  const updatePost = useCallback((id: string, updates: Partial<BlogPost>) => {
    const updated = posts.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().split("T")[0] } : p
    );
    savePosts(updated);
  }, [posts]);

  const deletePost = useCallback((id: string) => {
    savePosts(posts.filter((p) => p.id !== id));
    const newComments = { ...comments };
    delete newComments[id];
    saveComments(newComments);
  }, [posts, comments]);

  const likePost = useCallback((id: string) => {
    setLikedPosts((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("openblog_likes", JSON.stringify(next));
      return next;
    });
  }, []);

  const bookmarkPost = useCallback((id: string) => {
    setBookmarkedPosts((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("openblog_bookmarks", JSON.stringify(next));
      return next;
    });
  }, []);

  const getComments = useCallback((postId: string) => comments[postId] || [], [comments]);

  const addComment = useCallback((postId: string, content: string): Comment => {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      authorId: user?.id || "anon",
      authorName: user?.name || "Anonymous",
      authorAvatar: user?.avatar || "",
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
    };
    const newComments = { ...comments };
    newComments[postId] = [...(newComments[postId] || []), newComment];
    saveComments(newComments);
    return newComment;
  }, [comments, user]);

  const deleteComment = useCallback((postId: string, commentId: string) => {
    const newComments = { ...comments };
    if (newComments[postId]) {
      newComments[postId] = newComments[postId].filter(c => c.id !== commentId);
    }
    saveComments(newComments);
  }, [comments]);

  const likeComment = useCallback((postId: string, commentId: string) => {
    const newComments = { ...comments };
    if (newComments[postId]) {
      newComments[postId] = newComments[postId].map(c =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      );
    }
    saveComments(newComments);
  }, [comments]);

  const getRelatedPosts = useCallback((postId: string) => {
    const post = getPost(postId);
    if (!post) return [];
    
    return getPublishedPosts()
      .filter(p => p.id !== postId && p.tags.some(tag => post.tags.includes(tag)))
      .slice(0, 4);
  }, [posts]);

  const incrementView = useCallback((postId: string) => {
    updatePost(postId, { views: (getPost(postId)?.views || 0) + 1 });
  }, [getPost, updatePost]);

  const isBookmarked = useCallback((id: string) => bookmarkedPosts.includes(id), [bookmarkedPosts]);
  const isLiked = useCallback((id: string) => likedPosts.includes(id), [likedPosts]);

  return (
    <BlogContext.Provider value={{
      posts, getPost, getPublishedPosts, getMyPosts,
      createPost, updatePost, deletePost,
      likePost, bookmarkPost, isBookmarked, isLiked,
      bookmarkedPosts, likedPosts,
      getComments, addComment, deleteComment, likeComment,
      getRelatedPosts, incrementView,
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlog must be used within BlogProvider");
  return ctx;
};
