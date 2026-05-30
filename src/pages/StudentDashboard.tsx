import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, BookOpen, FileText, TrendingUp, Award, ArrowLeft, Send, Megaphone, Loader2, Film,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import NotificationCenter from "@/components/NotificationCenter";
import AssignmentSubmission from "@/components/AssignmentSubmission";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { analyticsService } from "@/services/analyticsService";
import { courseService, Course } from "@/services/courseService";
import { assignmentService, Assignment } from "@/services/assignmentService";
import { announcementService, Announcement } from "@/services/announcementService";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [open, setOpen] = useState(false);

  const loadAll = async () => {
    try {
      const [s, c, a, ann] = await Promise.all([
        analyticsService.student(),
        courseService.list(),
        assignmentService.list(),
        announcementService.list(),
      ]);
      setStats(s);
      setCourses(c);
      setAssignments(a);
      setAnnouncements(ann);
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

  const todayName = WEEKDAYS[new Date().getDay()];
  const todaySchedule = courses.flatMap((c) =>
    (c.schedule || [])
      .filter((slot) => slot.day === todayName)
      .map((slot) => ({ ...slot, title: c.title, teacher: c.teacher?.name, color: c.color }))
  );

  const submittedCount = assignments.filter((a) =>
    ["submitted", "late", "graded"].includes(a.submissionStatus || "")
  ).length;

  const gradedAssignments = assignments.filter((a) => a.submissionStatus === "graded");

  const statCards = [
    { label: "Attendance", value: `${stats.attendancePercentage}%`, icon: Calendar, grad: "from-emerald-500 to-teal-500" },
    { label: "Assignments", value: `${submittedCount}/${assignments.length}`, icon: FileText, grad: "from-amber-500 to-orange-500" },
    { label: "Overall Grade", value: stats.overallGrade, icon: TrendingUp, grad: "from-indigo-500 to-purple-500" },
    { label: "Badges Earned", value: String(stats.badgesEarned), icon: Award, grad: "from-pink-500 to-rose-500" },
  ];

  const openSubmit = (a: Assignment) => {
    setSelected(a);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 -left-4 w-[600px] h-[600px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob pointer-events-none dark:bg-purple-900/40"></div>
      <div className="fixed top-0 -right-4 w-[600px] h-[600px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animate-delay-2000 pointer-events-none dark:bg-blue-900/40"></div>

      <header className="sticky top-4 z-50 mx-4 lg:mx-auto max-w-7xl glass-panel rounded-full shadow-elevated">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">Student Dashboard</h1>
              <p className="text-sm font-medium text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-full hidden sm:flex" onClick={() => navigate("/lectures")}>
              <Film className="h-4 w-4 mr-1" /> Lectures
            </Button>
            <Button variant="outline" size="sm" className="rounded-full hidden sm:flex" onClick={() => navigate("/courses")}>
              <BookOpen className="h-4 w-4 mr-1" /> Courses
            </Button>
            <NotificationCenter />
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8 relative z-10">
          {statCards.map((stat) => (
            <Card key={stat.label} className="glass-panel hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group border-0">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-2xl bg-gradient-to-br ${stat.grad} p-4 shadow-card group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-extrabold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 lg:col-span-2 relative z-10">
            {/* Schedule */}
            <Card className="glass-panel border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Today's Schedule ({todayName})
                </CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySchedule.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No classes scheduled today 🎉</p>
                )}
                {todaySchedule.map((cls, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-2xl bg-white/40 dark:bg-black/20 p-4 hover:scale-[1.02] transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md" style={{ background: cls.color || "#6366f1" }}>
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{cls.title}</h4>
                        <p className="text-sm text-muted-foreground">{cls.teacher} • {cls.room}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{cls.time}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Grade trend chart */}
            <Card className="glass-panel border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Grade Trend
                </CardTitle>
                <CardDescription>Your scores on recent graded work (%)</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.gradeTrend?.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={stats.gradeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis domain={[0, 100]} fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">No graded assignments yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent grades */}
            <Card className="glass-panel border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Recent Grades
                </CardTitle>
                <CardDescription>Your latest assessment results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gradedAssignments.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No grades posted yet.</p>
                )}
                {gradedAssignments.map((g) => {
                  const pct = Math.round(((g.grade || 0) / g.maxMarks) * 100);
                  return (
                    <div key={g._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{g.title}</p>
                          <p className="text-sm text-muted-foreground">{g.course?.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{g.grade}/{g.maxMarks}</p>
                          <p className="text-sm text-muted-foreground">{pct}%</p>
                        </div>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-6 relative z-10">
            {/* Assignments */}
            <Card className="glass-panel border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Assignments
                </CardTitle>
                <CardDescription>Track and submit your work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignments.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No assignments yet.</p>
                )}
                {assignments.map((a) => (
                  <div key={a._id} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{a.title}</h4>
                        <p className="text-sm text-muted-foreground">{a.course?.code}</p>
                      </div>
                      <Badge
                        variant={a.submissionStatus === "graded" ? "default" : a.submissionStatus === "pending" ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {a.submissionStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                    <Button size="sm" className="w-full mt-1" onClick={() => openSubmit(a)} variant={a.submissionStatus === "pending" ? "default" : "outline"}>
                      <Send className="h-3 w-3 mr-1" />
                      {a.submissionStatus === "graded" ? "View Grade" : a.submissionStatus === "pending" ? "Submit" : "View / Resubmit"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="glass-panel border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" /> Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.badges?.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {stats.badges.map((badge: string, idx: number) => (
                      <div key={idx} className="flex flex-col items-center gap-2 rounded-lg bg-gradient-accent p-3 text-center text-white">
                        <Award className="h-6 w-6" />
                        <p className="text-xs font-medium">{badge}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Earn badges by attending classes and scoring well!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="glass-panel border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" /> Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No announcements.</p>
                )}
                {announcements.slice(0, 5).map((a) => (
                  <div key={a._id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{a.title}</p>
                      {a.priority === "high" && <Badge variant="destructive" className="text-xs">High</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">— {a.author?.name}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AssignmentSubmission
        isOpen={open}
        onClose={() => { setOpen(false); setSelected(null); }}
        assignment={selected}
        onSubmitted={loadAll}
      />
    </div>
  );
};

export default StudentDashboard;
