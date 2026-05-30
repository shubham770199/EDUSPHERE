import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, GraduationCap, BookOpen, TrendingUp, UserPlus, ArrowLeft, Megaphone, Trash2, Loader2, Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import NotificationCenter from "@/components/NotificationCenter";
import AnnouncementDialog from "@/components/AnnouncementDialog";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { toast } from "sonner";
import { analyticsService } from "@/services/analyticsService";
import { userService } from "@/services/userService";
import { User } from "@/types/auth";

const PIE_COLORS = ["#10b981", "#6366f1", "#f43f5e"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", department: "" });
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    try {
      const [s, u] = await Promise.all([analyticsService.admin(), userService.list()]);
      setStats(s);
      setUsers(u);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRole = async (id: string, role: string) => {
    try {
      await userService.update(id, { role: role as any });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: role as any } : u)));
      toast.success("Role updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      await userService.update(id, { status });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
      toast.success("Status updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await userService.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted");
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required");
      return;
    }
    setSaving(true);
    try {
      await userService.create(form as any);
      toast.success("User created");
      setAddOpen(false);
      setForm({ name: "", email: "", password: "", role: "student", department: "" });
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats.counts.students, icon: GraduationCap, grad: "from-indigo-500 to-purple-500" },
    { label: "Total Teachers", value: stats.counts.teachers, icon: Users, grad: "from-sky-500 to-blue-500" },
    { label: "Active Courses", value: stats.counts.courses, icon: BookOpen, grad: "from-pink-500 to-rose-500" },
    { label: "Total Assignments", value: stats.counts.assignments, icon: TrendingUp, grad: "from-emerald-500 to-teal-500" },
  ];

  const roleBadge = (role: string) =>
    role === "admin" ? "destructive" : role === "teacher" ? "default" : "secondary";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur shadow-card sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAnnounceOpen(true)} className="hidden sm:flex">
              <Megaphone className="mr-2 h-4 w-4" /> Announce
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Add User
            </Button>
            <NotificationCenter />
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="shadow-card hover:shadow-elevated transition-all">
              <CardContent className="p-6">
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${stat.grad} p-3 mb-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> User Distribution</CardTitle>
              <CardDescription>Breakdown of platform roles</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stats.roleBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {stats.roleBreakdown.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Registrations Over Time</CardTitle>
              <CardDescription>New users per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis allowDecimals={false} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#ec4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User management */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> User Management</CardTitle>
            <CardDescription>Manage roles and account status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                      <TableCell>
                        <Select value={u.role} onValueChange={(v) => changeRole(u.id, v)} disabled={u.id === user?.id}>
                          <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={u.status || "active"} onValueChange={(v) => changeStatus(u.id, v)} disabled={u.id === user?.id}>
                          <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteUser(u.id)}
                          disabled={u.id === user?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Course stats + recent users */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Course Overview</CardTitle>
              <CardDescription>Enrollment per course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.courseStats.map((c: any) => (
                <div key={c.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{c.name}</h4>
                      <p className="text-sm text-muted-foreground">{c.code} • {c.teacher}</p>
                    </div>
                    <Badge variant="outline">{c.students} students</Badge>
                  </div>
                </div>
              ))}
              {stats.courseStats.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No courses yet.</p>}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Recent Users</CardTitle>
              <CardDescription>Latest registrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-white text-sm font-semibold">
                      {u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{u.name}</h4>
                      <p className="text-xs text-muted-foreground">{u.department} • {new Date(u.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={roleBadge(u.role) as any} className="capitalize">{u.role}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add user dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Create a student, teacher or admin account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addUser} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AnnouncementDialog isOpen={announceOpen} onClose={() => setAnnounceOpen(false)} onCreated={loadAll} />
    </div>
  );
};

export default AdminDashboard;
