import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [blogName, setBlogName] = useState("My Nova Blog");
  const [domain, setDomain] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  const handleSave = async () => {
    try {
      const { meApi } = await import("@/lib/api");
      await meApi.updateSettings({
        blogName,
        emailNotifications,
        weeklyDigest,
        publicProfile,
      });
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { meApi } = await import("@/lib/api");
      await meApi.deleteAccount();
    } catch {
      // Continue even if API fails
    }
    logout();
    localStorage.clear();
    toast.success("Account deleted");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-foreground font-heading">Settings</span>
          </div>
          <Button variant="hero" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* Blog Settings */}
        <section>
          <h2 className="text-xl font-bold text-foreground font-heading mb-6">Blog Settings</h2>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Blog Name</label>
              <Input value={blogName} onChange={(e) => setBlogName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Custom Domain</label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourblog.com"
              />
              <p className="text-xs text-muted-foreground mt-1">Add a CNAME record pointing to nova-chronicle.app</p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xl font-bold text-foreground font-heading mb-6">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive emails about comments and likes</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Weekly Digest</p>
                <p className="text-xs text-muted-foreground">Get a weekly summary of your blog performance</p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Public Profile</p>
                <p className="text-xs text-muted-foreground">Allow others to see your profile page</p>
              </div>
              <Switch checked={publicProfile} onCheckedChange={setPublicProfile} />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-xl font-bold text-destructive font-heading mb-6">Danger Zone</h2>
          <div className="border border-destructive/30 rounded-xl p-6">
            <p className="text-sm text-foreground font-medium mb-2">Delete Account</p>
            <p className="text-xs text-muted-foreground mb-4">
              Once you delete your account, there is no going back. All your posts and data will be permanently removed.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account, all posts, and data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>Delete Everything</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
