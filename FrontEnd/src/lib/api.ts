// API client for OpenBlog backend
// Replaces localStorage-based data with real REST API calls

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : `http://${window.location.hostname}:3001`);

// ─── Token Management ─────────────────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem('openblog_token');
}

export function setToken(token: string): void {
  localStorage.setItem('openblog_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('openblog_token');
}

// ─── HTTP Client ──────────────────────────────────────────────────────────────
interface FetchOptions extends RequestInit {
  auth?: boolean;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json() as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export interface ApiUser {
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

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      auth: false,
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    }),

  me: () => apiFetch<ApiUser>('/api/auth/me'),
};

// ─── Posts API ────────────────────────────────────────────────────────────────
export interface ApiPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: { id: string; name: string; avatar: string };
  tags: string[];
  status: 'published' | 'draft' | 'archived' | 'scheduled';
  views: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface CreatePostInput {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived' | 'scheduled';
}

export const postsApi = {
  getPublished: (params?: { q?: string; tag?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<ApiPost[]>(`/api/posts${query ? '?' + query : ''}`, { auth: false });
  },

  getMine: () => apiFetch<ApiPost[]>('/api/posts/mine'),

  getById: (id: string) => apiFetch<ApiPost>(`/api/posts/${id}`, { auth: false }),

  create: (data: CreatePostInput) =>
    apiFetch<ApiPost>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreatePostInput>) =>
    apiFetch<ApiPost>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/posts/${id}`, { method: 'DELETE' }),

  incrementView: (id: string) =>
    apiFetch<{ views: number }>(`/api/posts/${id}/view`, { method: 'POST', auth: false }),

  like: (id: string) =>
    apiFetch<{ liked: boolean }>(`/api/posts/${id}/like`, { method: 'POST' }),

  bookmark: (id: string) =>
    apiFetch<{ bookmarked: boolean }>(`/api/posts/${id}/bookmark`, { method: 'POST' }),

  getRelated: (id: string) => apiFetch<ApiPost[]>(`/api/posts/${id}/related`, { auth: false }),

  getComments: (postId: string) => apiFetch<ApiComment[]>(`/api/posts/${postId}/comments`, { auth: false }),

  addComment: (postId: string, content: string) =>
    apiFetch<ApiComment>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  deleteComment: (postId: string, commentId: string) =>
    apiFetch<{ success: boolean }>(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),

  likeComment: (postId: string, commentId: string) =>
    apiFetch<{ likes: number; liked: boolean }>(`/api/posts/${postId}/comments/${commentId}/like`, { method: 'POST' }),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export interface ApiComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: ApiComment[];
}

export const usersApi = {
  getAll: (params?: { q?: string }) => {
    const query = params?.q ? `?q=${encodeURIComponent(params.q)}` : '';
    return apiFetch<ApiUser[]>(`/api/users${query}`, { auth: false });
  },

  getById: (id: string) => apiFetch<ApiUser>(`/api/users/${id}`, { auth: false }),

  follow: (userId: string) =>
    apiFetch<{ following: boolean; followersCount: number }>(`/api/users/${userId}/follow`, { method: 'POST' }),

  unfollow: (userId: string) =>
    apiFetch<{ following: boolean; followersCount: number }>(`/api/users/${userId}/follow`, { method: 'DELETE' }),
};

// ─── Me API ───────────────────────────────────────────────────────────────────
export interface ApiStats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageReadTime: number;
  publishedCount: number;
  draftCount: number;
  followersCount: number;
}

export interface ApiSettings {
  blogName: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  publicProfile: boolean;
}

export const meApi = {
  get: () => apiFetch<ApiUser>('/api/me'),

  update: (updates: Partial<ApiUser>) =>
    apiFetch<ApiUser>('/api/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  getBookmarks: () => apiFetch<ApiPost[]>('/api/me/bookmarks'),

  getFollowers: () => apiFetch<ApiUser[]>('/api/me/followers'),

  getFollowing: () => apiFetch<ApiUser[]>('/api/me/following'),

  getStats: () => apiFetch<ApiStats>('/api/me/stats'),

  getSettings: () => apiFetch<ApiSettings>('/api/me/settings'),

  updateSettings: (settings: Partial<ApiSettings>) =>
    apiFetch<ApiSettings>('/api/me/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  deleteAccount: () =>
    apiFetch<{ success: boolean }>('/api/me', { method: 'DELETE' }),
};

// ─── Health Check ─────────────────────────────────────────────────────────────
export const checkHealth = () =>
  apiFetch<{ status: string; timestamp: string }>('/health', { auth: false });
