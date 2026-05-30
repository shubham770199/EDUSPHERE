import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, FileText, Calendar, TrendingUp, Upload, Plus, ArrowLeft, Megaphone, BookOpen, Loader2, CheckSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import NotificationCenter from "@/components/NotificationCenter";
import AttendanceMarking from "@/components/AttendanceMarking";
import AssignmentUpload from "@/components/AssignmentUpload";
import GradeSubmissions from "@/components/GradeSubmissions";
import AnnouncementDialog from "@/components/AnnouncementDialog";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { analyticsService } from "@/services/analyticsService";
import { courseService, Course } from "@/services/courseService";
import { assignmentService, Assignment } from "@/services/assignmentService";
import { submissionService, Submission } from "@/services/submissionService";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pending, setPending] = useState<Submission[]>([]);

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [gradeTarget, setGradeTarget] = useState<Assignment | null>(null);

  const loadAll = async () => {
    try {
      const [s, c, a, p] = await Promise.all([
        analyticsService.teacher(),
        courseService.list(),
        assignmentService.list(),
        submissionService.pending(),
      ]);
      setStats(s);
      setCourses(c);
      setAssignments(a);
      setPending(p);
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

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats.counts.students, icon: Users, grad: "from-indigo-500 to-purple-500" },
    { label: "Active Courses", value: stats.counts.courses, icon: Calendar, grad: "from-sky-500 to-blue-500" },
    { label: "Pending Grading", value: stats.counts.pendingGrading, icon: FileText, grad: "from-amber-500 to-orange-500" },
    { label: "Avg. Performance", value: `${stats.avgPerformance}%`, icon: TrendingUp, grad: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur shadow-card sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAnnounceOpen(true)} className="hidden sm:flex">
              <Megaphone className="mr-2 h-4 w-4" /> Announce
            </Button>
            <Button onClick={() => setAssignmentOpen(true)} className="hidden sm:flex">
              <Plus className="mr-2 h-4 w-4" /> Assignment
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
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-2xl bg-gradient-to-br ${stat.grad} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer shadow-card hover:scale-105 hover:shadow-elevated transition-all" onClick={() => setAssignmentOpen(true)}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-gradient-accent p-3 text-white"><Upload className="h-6 w-6" /></div>
              <div><h3 className="font-semibold">Create Assignment</h3><p className="text-sm text-muted-foreground">Post new work</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer shadow-card hover:scale-105 hover:shadow-elevated transition-all" onClick={() => setAttendanceOpen(true)}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-gradient-accent p-3 text-white"><Calendar className="h-6 w-6" /></div>
              <div><h3 className="font-semibold">Mark Attendance</h3><p className="text-sm text-muted-foreground">Today's records</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer shadow-card hover:scale-105 hover:shadow-elevated transition-all" onClick={() => navigate("/courses")}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-gradient-accent p-3 text-white"><BookOpen className="h-6 w-6" /></div>
              <div><h3 className="font-semibold">Manage Courses</h3><p className="text-sm text-muted-foreground">Create & enroll</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 lg:col-span-2">
            {/* Course performance chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Enrollment by Course</CardTitle>
                <CardDescription>Students enrolled in each of your courses</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.coursePerformance?.length ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={stats.coursePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis allowDecimals={false} fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">No courses yet. Create one to get started.</p>
                )}
              </CardContent>
            </Card>

            {/* My assignments with grade action */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> My Assignments</CardTitle>
                <CardDescription>Review submissions and grade student work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No assignments yet.</p>}
                {assignments.map((a) => (
                  <div key={a._id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold">{a.title}</h4>
                      <p className="text-sm text-muted-foreground">{a.course?.code} • Due {new Date(a.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{a.gradedCount}/{a.submissionCount} graded</Badge>
                      <Button size="sm" onClick={() => setGradeTarget(a)}>
                        <CheckSquare className="h-4 w-4 mr-1" /> Grade
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Pending submissions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Pending Submissions ({pending.length})</CardTitle>
                <CardDescription>Awaiting your review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pending.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">All caught up! 🎉</p>}
                {pending.slice(0, 6).map((s) => (
                  <div key={s._id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{s.student?.name}</h4>
                      <p className="text-xs text-muted-foreground">{(s.assignment as any)?.title}</p>
                    </div>
                    <Badge variant={s.status === "late" ? "destructive" : "secondary"} className="capitalize text-xs">{s.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* My courses */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> My Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {courses.map((c) => (
                  <div key={c._id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <h4 className="font-semibold text-sm">{c.title}</h4>
                      <p className="text-xs text-muted-foreground">{c.code} • {c.students.length} students</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setAttendanceOpen(true)}>Attendance</Button>
                  </div>
                ))}
                {courses.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No courses yet.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AttendanceMarking isOpen={attendanceOpen} onClose={() => setAttendanceOpen(false)} />
      <AssignmentUpload isOpen={assignmentOpen} onClose={() => setAssignmentOpen(false)} onCreated={loadAll} />
      <AnnouncementDialog isOpen={announceOpen} onClose={() => setAnnounceOpen(false)} onCreated={loadAll} />
      <GradeSubmissions
        isOpen={!!gradeTarget}
        onClose={() => setGradeTarget(null)}
        assignment={gradeTarget}
        onGraded={loadAll}
      />
    </div>
  );
};

export default TeacherDashboard;
