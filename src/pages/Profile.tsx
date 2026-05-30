import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, KeyRound, Mail, Shield, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import NotificationCenter from "@/components/NotificationCenter";
import { toast } from "sonner";
import { userService } from "@/services/userService";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, refreshUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    department: user?.department || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    rollNumber: user?.rollNumber || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingPwd, setSavingPwd] = useState(false);

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await userService.updateProfile(profile);
      updateUser(res.user);
      await refreshUser();
      toast.success("Profile updated ✅");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (pwd.newPassword !== pwd.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPwd(true);
    try {
      await userService.changePassword(pwd.currentPassword, pwd.newPassword);
      toast.success("Password changed ✅");
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur shadow-card sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/${user.role}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Summary */}
        <Card className="shadow-card">
          <CardContent className="flex flex-col sm:flex-row items-center gap-6 p-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-gradient-primary text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {user.email}</span>
                <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> <Badge variant="outline" className="capitalize">{user.role}</Badge></span>
                {user.createdAt && (
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit profile */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Full Name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Department</Label><Input value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                {user.role === "student" && (
                  <div className="space-y-2"><Label>Roll Number</Label><Input value={profile.rollNumber} onChange={(e) => setProfile({ ...profile, rollNumber: e.target.value })} /></div>
                )}
              </div>
              <div className="space-y-2"><Label>Bio</Label><Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself..." /></div>
              <Button type="submit" disabled={savingProfile}>
                <Save className="h-4 w-4 mr-1" /> {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Change Password</CardTitle>
            <CardDescription>Keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} /></div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>New Password</Label><Input type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} /></div>
                <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} /></div>
              </div>
              <Button type="submit" variant="secondary" disabled={savingPwd}>
                {savingPwd ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
