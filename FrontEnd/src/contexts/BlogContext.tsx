import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { postsApi, type ApiPost, type ApiComment } from "@/lib/api";
import { useAuth } from "./AuthContext";

// Re-export BlogPost type that matches the API shape
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
  likesCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
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

interface BlogContextType {
  posts: BlogPost[];
  isLoading: boolean;
  getPost: (id: string) => BlogPost | undefined;
  getPublishedPosts: () => BlogPost[];
  getMyPosts: () => BlogPost[];
  createPost: (post: Omit<BlogPost, "id" | "author" | "views" | "readTime" | "createdAt" | "updatedAt">) => Promise<BlogPost>;
  updatePost: (id: string, updates: Partial<BlogPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  bookmarkPost: (id: string) => Promise<void>;
  isBookmarked: (id: string) => boolean;
  isLiked: (id: string) => boolean;
  bookmarkedPosts: string[];
  likedPosts: string[];
  // Comments
  getComments: (postId: string) => Comment[];
  loadComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<Comment>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => Promise<void>;
  getRelatedPosts: (postId: string) => BlogPost[];
  incrementView: (postId: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | null>(null);

function apiPostToBlogPost(p: ApiPost): BlogPost {
  return {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    author: p.author,
    tags: p.tags,
    status: p.status,
    views: p.views,
    readTime: p.readTime,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    likesCount: p.likesCount,
    isLiked: p.isLiked,
    isBookmarked: p.isBookmarked,
  };
}

function apiCommentToComment(c: ApiComment): Comment {
  return {
    id: c.id,
    postId: c.postId,
    authorId: c.authorId,
    authorName: c.authorName,
    authorAvatar: c.authorAvatar,
    content: c.content,
    createdAt: c.createdAt,
    likes: c.likes,
    replies: [],
  };
}

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [myPosts, setMyPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});

  // Load all published posts and my posts on mount
  const refreshPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const published = await postsApi.getPublished();
      setPosts(published.map(apiPostToBlogPost));

      if (isAuthenticated) {
        const mine = await postsApi.getMine();
        setMyPosts(mine.map(apiPostToBlogPost));

        // Compute liked/bookmarked from API response
        const likedIds = mine.filter(p => p.isLiked).map(p => p.id);
        const bookmarkedIds = mine.filter(p => p.isBookmarked).map(p => p.id);
        // Also check published posts
        const publishedLiked = published.filter(p => p.isLiked).map(p => p.id);
        const publishedBookmarked = published.filter(p => p.isBookmarked).map(p => p.id);
        setLikedPosts([...new Set([...likedIds, ...publishedLiked])]);
        setBookmarkedPosts([...new Set([...bookmarkedIds, ...publishedBookmarked])]);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshPosts();
  }, [isAuthenticated]);

  const getPost = useCallback((id: string) => {
    return [...posts, ...myPosts].find(p => p.id === id);
  }, [posts, myPosts]);

  const getPublishedPosts = useCallback(() => {
    return posts.filter(p => p.status === 'published');
  }, [posts]);

  const getMyPosts = useCallback(() => {
    if (!user) return [];
    return myPosts;
  }, [myPosts, user]);

  const createPost = useCallback(async (data: Omit<BlogPost, "id" | "author" | "views" | "readTime" | "createdAt" | "updatedAt">): Promise<BlogPost> => {
    const apiPost = await postsApi.create({
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      tags: data.tags,
      status: data.status,
    });
    const blogPost = apiPostToBlogPost(apiPost);
    setMyPosts(prev => [blogPost, ...prev]);
    if (data.status === 'published') {
      setPosts(prev => [blogPost, ...prev]);
    }
    return blogPost;
  }, []);

  const updatePost = useCallback(async (id: string, updates: Partial<BlogPost>) => {
    const apiPost = await postsApi.update(id, {
      title: updates.title,
      excerpt: updates.excerpt,
      content: updates.content,
      coverImage: updates.coverImage,
      tags: updates.tags,
      status: updates.status,
    });
    const blogPost = apiPostToBlogPost(apiPost);

    setMyPosts(prev => prev.map(p => p.id === id ? blogPost : p));
    setPosts(prev => {
      const exists = prev.find(p => p.id === id);
      if (exists) {
        return prev.map(p => p.id === id ? blogPost : p);
      }
      if (updates.status === 'published') {
        return [blogPost, ...prev];
      }
      return prev;
    });
  }, []);

  const deletePost = useCallback(async (id: string) => {
    await postsApi.delete(id);
    setMyPosts(prev => prev.filter(p => p.id !== id));
    setPosts(prev => prev.filter(p => p.id !== id));
    setComments(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const likePost = useCallback(async (id: string) => {
    try {
      const { liked } = await postsApi.like(id);
      setLikedPosts(prev => {
        const next = liked ? [...prev, id] : prev.filter(x => x !== id);
        return [...new Set(next)];
      });
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  }, []);

  const bookmarkPost = useCallback(async (id: string) => {
    try {
      const { bookmarked } = await postsApi.bookmark(id);
      setBookmarkedPosts(prev => {
        const next = bookmarked ? [...prev, id] : prev.filter(x => x !== id);
        return [...new Set(next)];
      });
    } catch (err) {
      console.error("Failed to bookmark post:", err);
    }
  }, []);

  const isBookmarked = useCallback((id: string) => bookmarkedPosts.includes(id), [bookmarkedPosts]);
  const isLiked = useCallback((id: string) => likedPosts.includes(id), [likedPosts]);

  const loadComments = useCallback(async (postId: string) => {
    try {
      const apiComments = await postsApi.getComments(postId);
      setComments(prev => ({
        ...prev,
        [postId]: apiComments.map(apiCommentToComment),
      }));
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  }, []);

  const getComments = useCallback((postId: string) => comments[postId] || [], [comments]);

  const addComment = useCallback(async (postId: string, content: string): Promise<Comment> => {
    const apiComment = await postsApi.addComment(postId, content);
    const comment = apiCommentToComment(apiComment);
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment],
    }));
    return comment;
  }, []);

  const deleteComment = useCallback(async (postId: string, commentId: string) => {
    await postsApi.deleteComment(postId, commentId);
    setComments(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).filter(c => c.id !== commentId),
    }));
  }, []);

  const likeComment = useCallback(async (postId: string, commentId: string) => {
    const { likes } = await postsApi.likeComment(postId, commentId);
    setComments(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).map(c =>
        c.id === commentId ? { ...c, likes } : c
      ),
    }));
  }, []);

  const getRelatedPosts = useCallback((postId: string) => {
    const post = getPost(postId);
    if (!post) return [];
    return getPublishedPosts()
      .filter(p => p.id !== postId && p.tags.some(tag => post.tags.includes(tag)))
      .slice(0, 4);
  }, [posts, getPost, getPublishedPosts]);

  const incrementView = useCallback(async (postId: string) => {
    try {
      const { views } = await postsApi.incrementView(postId);
      const updateViews = (p: BlogPost) => p.id === postId ? { ...p, views } : p;
      setPosts(prev => prev.map(updateViews));
      setMyPosts(prev => prev.map(updateViews));
    } catch (err) {
      // Silent fail for view increment
    }
  }, []);

  return (
    <BlogContext.Provider value={{
      posts,
      isLoading,
      getPost, getPublishedPosts, getMyPosts,
      createPost, updatePost, deletePost,
      likePost, bookmarkPost, isBookmarked, isLiked,
      bookmarkedPosts, likedPosts,
      getComments, loadComments, addComment, deleteComment, likeComment,
      getRelatedPosts, incrementView,
      refreshPosts,
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
