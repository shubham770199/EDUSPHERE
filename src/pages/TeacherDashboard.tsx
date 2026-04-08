import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Calendar, TrendingUp, Upload, Plus, ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import NotificationCenter from "@/components/NotificationCenter";
import { useState, useEffect } from "react";
import AttendanceMarking from "@/components/AttendanceMarking";
import AssignmentUpload from "@/components/AssignmentUpload";
import { assignmentService } from "@/services/assignmentService";
import { attendanceService } from "@/services/attendanceService";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Get teacher's assignments
      const assignments = assignmentService.getTeacherAssignments(user.id);
      setTeacherAssignments(assignments);

      // Get pending submissions
      const pending = assignmentService.getPendingSubmissions(user.id);
      setPendingSubmissions(pending);

      // Get courses
      const allCourses = attendanceService.getCourses();
      setCourses(allCourses);
    }
  }, [user]);

  const stats = [
    { label: "Total Students", value: "156", icon: Users, color: "text-primary" },
    { label: "Active Classes", value: courses.length.toString(), icon: Calendar, color: "text-secondary" },
    { label: "Pending Assignments", value: pendingSubmissions.length.toString(), icon: FileText, color: "text-warning" },
    { label: "Avg. Performance", value: "87%", icon: TrendingUp, color: "text-success" }
  ];

  const recentSubmissions = pendingSubmissions.slice(0, 3);

  const upcomingTasks = [
    { title: `Grade ${pendingSubmissions.length} Submissions`, deadline: "2024-01-20", priority: "high" },
    { title: "Update Attendance - Math 101", deadline: "2024-01-19", priority: "medium" },
    { title: "Prepare Quiz Questions", deadline: "2024-01-22", priority: "low" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name || 'Teacher'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAssignmentOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
            <NotificationCenter />
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-card transition-all hover:shadow-elevated">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-2xl bg-gradient-primary p-3 ${stat.color}`}>
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

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer shadow-card transition-all hover:scale-105 hover:shadow-elevated" onClick={() => setIsAssignmentOpen(true)}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-gradient-accent p-3 text-white">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Upload Material</h3>
                <p className="text-sm text-muted-foreground">Create assignment</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer shadow-card transition-all hover:scale-105 hover:shadow-elevated" onClick={() => setIsAttendanceOpen(true)}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-gradient-accent p-3 text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Mark Attendance</h3>
                <p className="text-sm text-muted-foreground">Update today's records</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer shadow-card transition-all hover:scale-105 hover:shadow-elevated">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-gradient-accent p-3 text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">View Analytics</h3>
                <p className="text-sm text-muted-foreground">Check performance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* My Classes */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  My Classes
                </CardTitle>
                <CardDescription>Manage your active classes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {courses.map((cls, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50">
                    <div className="flex-1">
                      <h4 className="font-semibold">{cls.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {cls.students?.length || 0} students
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button size="sm" onClick={() => setIsAttendanceOpen(true)}>Mark Attendance</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Pending Submissions ({pendingSubmissions.length})
                </CardTitle>
                <CardDescription>Student work to review and grade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingSubmissions.slice(0, 5).map((sub, idx) => {
                    const assignment = assignmentService.getAssignmentById(sub.assignmentId);
                    return (
                      <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{sub.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{assignment?.title}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            Pending
                          </Badge>
                          <p className="text-xs text-muted-foreground">{sub.submissionDate}</p>
                        </div>
                      </div>
                    );
                  })}
                  {pendingSubmissions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No pending submissions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Tasks */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingTasks.map((task, idx) => (
                  <div key={idx} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge 
                        variant={
                          task.priority === "high" ? "destructive" : 
                          task.priority === "medium" ? "secondary" : 
                          "outline"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Due: {task.deadline}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AttendanceMarking
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
      />

      <AssignmentUpload
        isOpen={isAssignmentOpen}
        onClose={() => {
          setIsAssignmentOpen(false);
          // Refresh assignments
          if (user) {
            const assignments = assignmentService.getTeacherAssignments(user.id);
            setTeacherAssignments(assignments);
          }
        }}
        teacherId={user?.id || ''}
      />
    </div>
  );
};

export default TeacherDashboard;
