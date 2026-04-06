import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  getAllUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  getFollowers: () => User[];
  getFollowing: () => User[];
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: (User & { password: string })[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    email: "sarah@openblog.co",
    password: "password",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    bio: "Tech blogger and open-source advocate. Writing about the web, one post at a time.",
    joinedAt: "2025-09-01",
  },
  {
    id: "u2",
    name: "Marcus Williams",
    email: "marcus@openblog.co",
    password: "password",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    bio: "Startup founder and TypeScript enthusiast.",
    joinedAt: "2025-10-15",
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("openblog_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [followingList, setFollowingList] = useState<string[]>(() => {
    const saved = localStorage.getItem("openblog_following");
    return saved ? JSON.parse(saved) : [];
  });

  const getAllUsers = useCallback(() => {
    const demoUsers = DEMO_USERS.map(u => {
      const { password: _, ...userData } = u;
      return { ...userData, postsCount: 2, followersCount: Math.floor(Math.random() * 100), followingCount: Math.floor(Math.random() * 50) };
    });
    const customUsers = JSON.parse(localStorage.getItem("openblog_custom_users") || "[]").map((u: any) => {
      const { password: _, ...userData } = u;
      return { ...userData, postsCount: Math.floor(Math.random() * 10), followersCount: Math.floor(Math.random() * 50), followingCount: Math.floor(Math.random() * 30) };
    });
    return [...demoUsers, ...customUsers];
  }, []);

  const getUserById = useCallback((id: string) => {
    return getAllUsers().find(u => u.id === id);
  }, [getAllUsers]);

  const login = useCallback((email: string, password: string): boolean => {
    const found = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      const userWithDefaults = {
        ...userData,
        postsCount: 2,
        followersCount: Math.floor(Math.random() * 100),
        followingCount: Math.floor(Math.random() * 50)
      };
      setUser(userWithDefaults);
      localStorage.setItem("openblog_user", JSON.stringify(userWithDefaults));
      return true;
    }
    // Also check localStorage for signed-up users
    const customUsers = JSON.parse(localStorage.getItem("openblog_custom_users") || "[]");
    const custom = customUsers.find((u: any) => u.email === email && u.password === password);
    if (custom) {
      const { password: _, ...userData } = custom;
      const userWithDefaults = {
        ...userData,
        postsCount: userData.postsCount || Math.floor(Math.random() * 10),
        followersCount: userData.followersCount || Math.floor(Math.random() * 50),
        followingCount: userData.followingCount || Math.floor(Math.random() * 30)
      };
      setUser(userWithDefaults);
      localStorage.setItem("openblog_user", JSON.stringify(userWithDefaults));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback((name: string, email: string, password: string): boolean => {
    const allEmails = [...DEMO_USERS.map((u) => u.email)];
    const customUsers = JSON.parse(localStorage.getItem("openblog_custom_users") || "[]");
    allEmails.push(...customUsers.map((u: any) => u.email));

    if (allEmails.includes(email)) return false;

    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      bio: "",
      joinedAt: new Date().toISOString().split("T")[0],
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
    };

    customUsers.push(newUser);
    localStorage.setItem("openblog_custom_users", JSON.stringify(customUsers));

    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem("openblog_user", JSON.stringify(userData));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("openblog_user");
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("openblog_user", JSON.stringify(updated));
      
      // Update custom users if applicable
      const customUsers = JSON.parse(localStorage.getItem("openblog_custom_users") || "[]");
      const userIndex = customUsers.findIndex((u: any) => u.email === prev.email);
      if (userIndex !== -1) {
        customUsers[userIndex] = { ...customUsers[userIndex], ...updates };
        localStorage.setItem("openblog_custom_users", JSON.stringify(customUsers));
      }
      
      return updated;
    });
  }, []);

  const followUser = useCallback((userId: string) => {
    if (!followingList.includes(userId)) {
      const newList = [...followingList, userId];
      setFollowingList(newList);
      localStorage.setItem("openblog_following", JSON.stringify(newList));
    }
  }, [followingList]);

  const unfollowUser = useCallback((userId: string) => {
    const newList = followingList.filter(id => id !== userId);
    setFollowingList(newList);
    localStorage.setItem("openblog_following", JSON.stringify(newList));
  }, [followingList]);

  const isFollowing = useCallback((userId: string) => followingList.includes(userId), [followingList]);

  const getFollowers = useCallback(() => {
    return getAllUsers().filter(u => u.id !== user?.id);
  }, [getAllUsers, user?.id]);

  const getFollowing = useCallback(() => {
    return getAllUsers().filter(u => followingList.includes(u.id));
  }, [getAllUsers, followingList]);

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
