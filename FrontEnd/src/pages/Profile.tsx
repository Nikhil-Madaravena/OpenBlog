import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, ArrowLeft, Save, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/contexts/BlogContext";
import { toast } from "sonner";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { getMyPosts } = useBlog();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const myPosts = getMyPosts();
  const publishedCount = myPosts.filter((p) => p.status === "published").length;
  const totalViews = myPosts.reduce((sum, p) => sum + p.views, 0);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, bio, avatar });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-foreground font-heading">Profile</span>
          </div>
          <Button variant="hero" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img src={avatar || user?.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-border" />
            <div className="absolute inset-0 rounded-full bg-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground font-heading">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">Member since {user?.joinedAt}</p>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span><strong className="text-foreground">{publishedCount}</strong> posts</span>
              <span><strong className="text-foreground">{totalViews.toLocaleString()}</strong> views</span>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Display Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Avatar URL</label>
            <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers about yourself..."
              className="min-h-[120px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
          </div>
        </div>

        {/* Recent posts */}
        {myPosts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground font-heading mb-4">Recent Posts</h3>
            <div className="space-y-3">
              {myPosts.slice(0, 5).map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors"
                >
                  <img src={post.coverImage} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.status} · {post.views} views</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
