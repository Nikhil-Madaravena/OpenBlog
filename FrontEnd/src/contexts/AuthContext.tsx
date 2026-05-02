import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { authApi, usersApi, getToken, setToken, clearToken, type ApiUser } from "@/lib/api";

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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  getUserById: (id: string) => Promise<User | undefined>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  getFollowers: () => Promise<User[]>;
  getFollowing: () => Promise<User[]>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("openblog_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [followingList, setFollowingList] = useState<string[]>(() => {
    const saved = localStorage.getItem("openblog_following");
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Refresh user from API on mount if token exists
  useEffect(() => {
    const token = getToken();
    if (token && !user) {
      authApi.me().then(apiUser => {
        const u = apiUserToUser(apiUser);
        setUser(u);
        localStorage.setItem("openblog_user", JSON.stringify(u));
      }).catch(() => {
        clearToken();
      });
    }
  }, []);

  function apiUserToUser(u: ApiUser): User {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      bio: u.bio,
      joinedAt: u.joinedAt,
      postsCount: u.postsCount,
      followersCount: u.followersCount,
      followingCount: u.followingCount,
    };
  }

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { token, user: apiUser } = await authApi.login(email, password);
      setToken(token);
      const u = apiUserToUser(apiUser);
      setUser(u);
      localStorage.setItem("openblog_user", JSON.stringify(u));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { token, user: apiUser } = await authApi.signup(name, email, password);
      setToken(token);
      const u = apiUserToUser(apiUser);
      setUser(u);
      localStorage.setItem("openblog_user", JSON.stringify(u));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearToken();
    localStorage.removeItem("openblog_user");
    localStorage.removeItem("openblog_following");
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const { meApi } = await import("@/lib/api");
      const updated = await meApi.update(updates);
      const u = apiUserToUser(updated);
      setUser(u);
      localStorage.setItem("openblog_user", JSON.stringify(u));
    } catch (err) {
      console.error("Failed to update profile:", err);
      // Fallback: update locally
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates };
        localStorage.setItem("openblog_user", JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    try {
      const users = await usersApi.getAll();
      return users.map(apiUserToUser);
    } catch {
      return [];
    }
  }, []);

  const getUserById = useCallback(async (id: string): Promise<User | undefined> => {
    try {
      const u = await usersApi.getById(id);
      return apiUserToUser(u);
    } catch {
      return undefined;
    }
  }, []);

  const followUser = useCallback(async (userId: string) => {
    try {
      await usersApi.follow(userId);
      if (!followingList.includes(userId)) {
        const newList = [...followingList, userId];
        setFollowingList(newList);
        localStorage.setItem("openblog_following", JSON.stringify(newList));
      }
    } catch (err) {
      console.error("Failed to follow user:", err);
    }
  }, [followingList]);

  const unfollowUser = useCallback(async (userId: string) => {
    try {
      await usersApi.unfollow(userId);
      const newList = followingList.filter(id => id !== userId);
      setFollowingList(newList);
      localStorage.setItem("openblog_following", JSON.stringify(newList));
    } catch (err) {
      console.error("Failed to unfollow user:", err);
    }
  }, [followingList]);

  const isFollowing = useCallback((userId: string) => followingList.includes(userId), [followingList]);

  const getFollowers = useCallback(async (): Promise<User[]> => {
    try {
      const { meApi } = await import("@/lib/api");
      const followers = await meApi.getFollowers();
      return followers.map(apiUserToUser);
    } catch {
      return [];
    }
  }, []);

  const getFollowing = useCallback(async (): Promise<User[]> => {
    try {
      const { meApi } = await import("@/lib/api");
      const following = await meApi.getFollowing();
      return following.map(apiUserToUser);
    } catch {
      return [];
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateProfile,
      getAllUsers,
      getUserById,
      followUser,
      unfollowUser,
      isFollowing,
      getFollowers,
      getFollowing,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
