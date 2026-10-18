import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PenLine, LayoutDashboard, FileText, Globe, Settings, LogOut,
  Bookmark, User, Shield, Users, FileBarChart, MessageSquare, Heart, UserCheck, Trash2, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi, type AdminUser, type AdminStats, type UserRole } from "@/lib/api";
import { toast } from "sonner";
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
  { icon: Shield, label: "Admin", path: "/admin" },
];

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([adminApi.getUsers(), adminApi.getStats()]);
      setUsers(usersRes);
      setStats(statsRes);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (targetUser: AdminUser, role: UserRole) => {
    setBusyUserId(targetUser.id);
    try {
      await adminApi.changeRole(targetUser.id, role);
      toast.success(`${targetUser.name} is now ${role === "ADMIN" ? "an admin" : "a regular user"}`);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (targetUser: AdminUser) => {
    setBusyUserId(targetUser.id);
    try {
      await adminApi.deleteUser(targetUser.id);
      toast.success(`${targetUser.name} was removed`);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users },
        { label: "Admins", value: stats.totalAdmins, icon: Shield },
        { label: "Published Posts", value: stats.publishedPosts, icon: FileBarChart },
        { label: "Draft Posts", value: stats.draftPosts, icon: FileText },
        { label: "Total Comments", value: stats.totalComments, icon: MessageSquare },
        { label: "Total Likes", value: stats.totalLikes, icon: Heart },
        { label: "Total Follows", value: stats.totalFollows, icon: UserCheck },
      ]
    : [];

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
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-bold font-heading text-foreground">Admin Dashboard</h1>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground font-heading">User Management</h2>
                  <span className="text-xs text-muted-foreground">RBAC — promote, demote, or remove accounts</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="px-5 py-3 font-medium">User</th>
                        <th className="px-5 py-3 font-medium">Role</th>
                        <th className="px-5 py-3 font-medium">Posts</th>
                        <th className="px-5 py-3 font-medium">Followers</th>
                        <th className="px-5 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const isSelf = u.id === user?.id;
                        const busy = busyUserId === u.id;
                        return (
                          <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <div>
                                  <p className="font-medium text-foreground">{u.name}{isSelf && " (you)"}</p>
                                  <p className="text-xs text-muted-foreground">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge>
                            </td>
                            <td className="px-5 py-3 text-foreground">{u.totalPosts}</td>
                            <td className="px-5 py-3 text-foreground">{u.followersCount ?? 0}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-end gap-2">
                                {!isSelf && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={busy}
                                    onClick={() => handleRoleChange(u, u.role === "ADMIN" ? "USER" : "ADMIN")}
                                  >
                                    {u.role === "ADMIN" ? "Demote" : "Promote"}
                                  </Button>
                                )}
                                {!isSelf && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" disabled={busy} className="text-destructive hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete {u.name}?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This permanently removes the account along with their posts, comments, likes and follows.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteUser(u)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
