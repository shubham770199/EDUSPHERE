import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, BookOpen, Users, Trash2, Loader2, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import NotificationCenter from "@/components/NotificationCenter";
import { toast } from "sonner";
import { courseService, Course } from "@/services/courseService";

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user?.role === "teacher" || user?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [available, setAvailable] = useState<Course[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", code: "", description: "", department: "", credits: 3 });

  const load = async () => {
    try {
      const mine = await courseService.list();
      setCourses(mine);
      if (user?.role === "student") {
        setAvailable(await courseService.available());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.code) {
      toast.error("Title and code are required");
      return;
    }
    setSaving(true);
    try {
      await courseService.create(form);
      toast.success("Course created");
      setCreateOpen(false);
      setForm({ title: "", code: "", description: "", department: "", credits: 3 });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setSaving(false);
    }
  };

  const enroll = async (id: string) => {
    try {
      await courseService.enroll(id);
      toast.success("Enrolled successfully");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to enroll");
    }
  };

  const unenroll = async (id: string) => {
    try {
      await courseService.unenroll(id);
      toast.success("Unenrolled");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    try {
      await courseService.remove(id);
      toast.success("Course deleted");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const CourseCard = ({ c, action }: { c: Course; action: React.ReactNode }) => (
    <Card className="shadow-card hover:shadow-elevated transition-all overflow-hidden">
      <div className="h-2" style={{ background: c.color || "#6366f1" }} />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{c.title}</CardTitle>
            <CardDescription>{c.code} • {c.department}</CardDescription>
          </div>
          <Badge variant="outline">{c.credits} cr</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{c.description || "No description."}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" /> {c.teacher?.name}
          <span className="mx-1">•</span>
          <Users className="h-4 w-4" /> {c.students.length}
        </div>
        {action}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur shadow-card sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/${user?.role}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Courses</h1>
              <p className="text-sm text-muted-foreground">
                {user?.role === "student" ? "Your enrolled courses" : "Manage your courses"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isStaff && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Course
              </Button>
            )}
            <NotificationCenter />
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {user?.role === "student" ? "My Courses" : "Courses"} ({courses.length})
          </h2>
          {courses.length === 0 ? (
            <p className="text-muted-foreground">
              {user?.role === "student" ? "You're not enrolled in any courses yet." : "No courses yet — create one!"}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <CourseCard
                  key={c._id}
                  c={c}
                  action={
                    user?.role === "student" ? (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => unenroll(c._id)}>
                        Unenroll
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full text-destructive" onClick={() => remove(c._id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>

        {user?.role === "student" && (
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Browse & Enroll ({available.length})
            </h2>
            {available.length === 0 ? (
              <p className="text-muted-foreground">No other courses available right now.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {available.map((c) => (
                  <CourseCard
                    key={c._id}
                    c={c}
                    action={
                      <Button size="sm" className="w-full" onClick={() => enroll(c._id)}>
                        Enroll
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Create course dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
            <DialogDescription>Add a new course you'll teach.</DialogDescription>
          </DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Data Structures" /></div>
              <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS301" /></div>
              <div className="space-y-2"><Label>Credits</Label><Input type="number" min={1} value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-2"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;
