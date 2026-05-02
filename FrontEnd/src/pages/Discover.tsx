import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/landing/Navbar";
import { Search, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usersApi } from "@/lib/api";

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export default function Discover() {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  // Load users from API
  useEffect(() => {
    setLoading(true);
    usersApi.getAll()
      .then(allUsers => {
        const filtered = allUsers.filter(u => u.id !== user?.id);
        setUsers(filtered as UserProfile[]);
        setFilteredUsers(filtered as UserProfile[]);
      })
      .catch(err => console.error("Failed to load users", err))
      .finally(() => setLoading(false));
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (search.trim()) {
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          (u.bio || "").toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [search, users]);

  const handleFollow = async (userId: string, currentlyFollowing: boolean) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to follow users");
      return;
    }

    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      if (currentlyFollowing) {
        await usersApi.unfollow(userId);
        toast.success("Unfollowed");
      } else {
        await usersApi.follow(userId);
        toast.success("Following!");
      }
      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === userId ? {
          ...u,
          isFollowing: !currentlyFollowing,
          followersCount: (u.followersCount || 0) + (currentlyFollowing ? -1 : 1),
        } : u
      ));
      setFilteredUsers(prev => prev.map(u =>
        u.id === userId ? {
          ...u,
          isFollowing: !currentlyFollowing,
          followersCount: (u.followersCount || 0) + (currentlyFollowing ? -1 : 1),
        } : u
      ));
    } catch (err) {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 pt-24">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Discover Writers</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Find and follow amazing writers in our community
          </p>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">
              {search ? "No writers found matching your search" : "No writers to discover"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((userProfile) => (
              <Card
                key={userProfile.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col items-center text-center mb-4">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage src={userProfile.avatar} />
                    <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">{userProfile.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {userProfile.bio || "No bio yet"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y border-border mb-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{userProfile.postsCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{userProfile.followersCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{userProfile.followingCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleFollow(userProfile.id, !!userProfile.isFollowing)}
                  variant={userProfile.isFollowing ? "outline" : "default"}
                  className="w-full"
                  disabled={followLoading[userProfile.id]}
                >
                  {followLoading[userProfile.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : userProfile.isFollowing ? "Following" : "Follow"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
