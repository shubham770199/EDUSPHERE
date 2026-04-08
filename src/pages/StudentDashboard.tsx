import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, FileText, TrendingUp, Award, Bell, ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import NotificationCenter from "@/components/NotificationCenter";
import AssignmentSubmission from "@/components/AssignmentSubmission";
import { useState, useEffect } from "react";
import axios from "axios";
import { attendanceService } from "@/services/attendanceService";
import { assignmentService } from "@/services/assignmentService";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      // In case auth context uses 'id' as email (fallback check)
      const emailToUse = user?.email || user?.id;
      if (!emailToUse) return;
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        let res = await axios.get(`${apiUrl}/api/dashboard/${emailToUse}`);

        // Automatically seed mock data if user just registered and DB is empty
        if (res.data && res.data.classes.length === 0) {
           await axios.post(`${apiUrl}/api/seed`, { email: emailToUse });
           res = await axios.get(`${apiUrl}/api/dashboard/${emailToUse}`);
        }
        
        setDashboardData(res.data);
      } catch (err) {
        console.error("Dashboard API Error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const handleSubmitAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsSubmissionOpen(true);
  };

  if (isLoading || !dashboardData) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const { userStats = {}, classes: upcomingClasses = [], grades: recentGrades = [], assignments = [] } = dashboardData;

  const stats = [
    { label: "Attendance", value: `${userStats.attendancePercentage || 92}%`, icon: Calendar, color: "text-success" },
    { label: "Assignments", value: `${assignments.filter((a: any) => a.submittedStatus === 'submitted').length}/${assignments.length || 0}`, icon: FileText, color: "text-warning" },
    { label: "Overall Grade", value: userStats.overallGrade || "A-", icon: TrendingUp, color: "text-primary" },
    { label: "Badges Earned", value: String(userStats.badgesEarned || 12), icon: Award, color: "text-accent" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background Mesh */}
      <div className="fixed top-0 -left-4 w-[600px] h-[600px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob pointer-events-none dark:bg-purple-900/40"></div>
      <div className="fixed top-0 -right-4 w-[600px] h-[600px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animate-delay-2000 pointer-events-none dark:bg-blue-900/40"></div>

      {/* Header */}
      <header className="sticky top-4 z-50 mx-4 lg:mx-auto max-w-7xl glass-panel rounded-full shadow-elevated transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">EduSphere Dashboard</h1>
              <p className="text-sm font-medium text-muted-foreground tracking-tight">Welcome back, {user?.name || 'Student'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8 relative z-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="glass-panel transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group border-0">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-2xl bg-gradient-primary p-4 shadow-card group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
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
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2 relative z-10">
            {/* Today's Schedule */}
            <Card className="glass-panel border-0 hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingClasses.map((cls, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-2xl border-0 bg-white/40 dark:bg-black/20 p-4 transition-all duration-300 hover:bg-white/60 hover:scale-[1.02] shadow-sm cursor-pointer mb-2">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-md">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{cls.subject}</h4>
                        <p className="text-sm text-muted-foreground">{cls.teacher} • {cls.room}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{cls.time}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card className="glass-panel border-0 hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recent Grades
                </CardTitle>
                <CardDescription>Your latest assessment results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentGrades.map((grade, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{grade.subject}</p>
                        <p className="text-sm text-muted-foreground">{grade.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{grade.grade}</p>
                        <p className="text-sm text-muted-foreground">{grade.percentage}%</p>
                      </div>
                    </div>
                    <Progress value={grade.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 relative z-10">
            {/* Assignments */}
            <Card className="glass-panel border-0 hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Assignments
                </CardTitle>
                <CardDescription>Track your submissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignments.map((assignment, idx) => (
                  <div key={idx} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground">{assignment.courseName}</p>
                      </div>
                      <Badge variant="secondary">
                        {assignment.submittedStatus || 'pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Due: {assignment.dueDate}</p>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => handleSubmitAssignment(assignment)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      {assignmentService.getStudentSubmission(assignment.id, user?.id || '') ? 'View/Resubmit' : 'Submit'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card className="glass-panel border-0 hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {["Perfect Attendance", "Top Scorer", "Quick Learner"].map((badge, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 rounded-lg bg-gradient-accent p-3 text-center text-white">
                      <Award className="h-6 w-6" />
                      <p className="text-xs font-medium">{badge}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AssignmentSubmission
        isOpen={isSubmissionOpen}
        onClose={() => {
          setIsSubmissionOpen(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        studentId={user?.id || ''}
        studentName={user?.name || ''}
      />
    </div>
  );
};

export default StudentDashboard;
