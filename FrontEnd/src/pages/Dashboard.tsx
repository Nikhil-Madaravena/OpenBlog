import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PenLine, LayoutDashboard, FileText, Globe, Settings, LogOut,
  Plus, Search, Eye, TrendingUp, Users, MoreHorizontal, Edit, Trash2,
  Bookmark, User
} from "lucide-react";
import { statusColors } from "@/data/mockData";
import { type BlogPost } from "@/contexts/BlogContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/contexts/BlogContext";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "My Posts", path: "/myposts" },
  { icon: Bookmark, label: "Bookmarks", path: "/dashboard/bookmarks" },
  { icon: Globe, label: "Explore", path: "/explore" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { posts, getMyPosts, deletePost, bookmarkedPosts, getPost } = useBlog();

  const isBookmarksView = location.pathname === "/dashboard/bookmarks";

  const myPosts = getMyPosts();
  const displayPosts = isBookmarksView
    ? bookmarkedPosts.map((id) => getPost(id)).filter(Boolean) as BlogPost[]
    : myPosts;

  const filteredPosts = displayPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || post.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const totalViews = myPosts.reduce((sum, p) => sum + p.views, 0);
  const publishedCount = myPosts.filter((p) => p.status === "published").length;

  const stats = [
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, change: "+12.5%" },
    { label: "Published", value: String(publishedCount), icon: FileText, change: `of ${myPosts.length}` },
    { label: "Subscribers", value: "1,280", icon: Users, change: "+8.2%" },
    { label: "Engagement", value: "68%", icon: TrendingUp, change: "+5.1%" },
  ];

  const filters = ["all", "published", "draft", "scheduled", "archived"];

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      toast.success("Post deleted successfully");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden lg:flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <PenLine className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-heading text-foreground">OpenBlog</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground">
              {isBookmarksView ? "Bookmarks" : "Dashboard"}
            </h1>
          </div>
          <Button variant="hero" size="sm" onClick={() => navigate("/editor")}>
            <Plus className="w-4 h-4 mr-1" />
            New Post
          </Button>
        </header>

        <div className="p-6 lg:p-8 space-y-8">
          {/* Stats - only on dashboard */}
          {!isBookmarksView && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-accent">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Posts Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground font-heading">
                  {isBookmarksView ? "Saved Posts" : "My Posts"}
                </h2>
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
              </div>

              {!isBookmarksView && (
                <div className="flex gap-2 mt-4">
                  {filters.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                        activeFilter === f
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Post</th>
                    <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Status</th>
                    <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Views</th>
                    <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Tags</th>
                    <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <PostRow key={post.id} post={post} onDelete={handleDelete} isOwner={!isBookmarksView} />
                  ))}
                </tbody>
              </table>
              {filteredPosts.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  <p>{isBookmarksView ? "No bookmarked posts yet." : "No posts found."}</p>
                  {!isBookmarksView && (
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/editor")}>
                      <Plus className="w-4 h-4 mr-1" /> Create your first post
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const PostRow = ({ post, onDelete, isOwner }: { post: BlogPost; onDelete: (id: string) => void; isOwner: boolean }) => {
  const navigate = useNavigate();

  return (
    <tr className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => navigate(`/blog/${post.id}`)}>
      <td className="py-4 px-5">
        <div className="flex items-center gap-3">
          <img src={post.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover hidden sm:block" />
          <div>
            <p className="font-medium text-foreground text-sm">{post.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {post.author.name} · {post.createdAt}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 px-5 hidden md:table-cell">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[post.status]}`}>
          {post.status}
        </span>
      </td>
      <td className="py-4 px-5 hidden lg:table-cell text-sm text-muted-foreground">
        {post.views.toLocaleString()}
      </td>
      <td className="py-4 px-5 hidden md:table-cell">
        <div className="flex gap-1 flex-wrap">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-secondary rounded-md text-secondary-foreground">
              #{tag}
            </span>
          ))}
        </div>
      </td>
      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && (
              <DropdownMenuItem onClick={() => navigate(`/editor/${post.id}`)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate(`/blog/${post.id}`)}>
              <Eye className="w-4 h-4 mr-2" /> View
            </DropdownMenuItem>
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete post?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete "{post.title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(post.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

export default Dashboard;
