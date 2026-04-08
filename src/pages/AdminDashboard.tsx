import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, BookOpen, TrendingUp, Settings, UserPlus, ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import NotificationCenter from "@/components/NotificationCenter";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { label: "Total Students", value: "1,234", icon: GraduationCap, color: "text-primary", change: "+12%" },
    { label: "Total Teachers", value: "87", icon: Users, color: "text-secondary", change: "+3%" },
    { label: "Active Courses", value: "156", icon: BookOpen, color: "text-accent", change: "+8%" },
    { label: "System Usage", value: "94%", icon: TrendingUp, color: "text-success", change: "+5%" }
  ];

  const recentUsers = [
    { name: "John Doe", role: "student", status: "active", joinDate: "2024-01-18" },
    { name: "Prof. Smith", role: "teacher", status: "active", joinDate: "2024-01-17" },
    { name: "Jane Wilson", role: "student", status: "pending", joinDate: "2024-01-16" }
  ];

  const systemAlerts = [
    { message: "Server maintenance scheduled", type: "info", time: "2 hours ago" },
    { message: "New feature deployment successful", type: "success", time: "5 hours ago" },
    { message: "Database backup completed", type: "success", time: "1 day ago" }
  ];

  const courseStats = [
    { name: "Computer Science", students: 456, completion: 87 },
    { name: "Mathematics", students: 398, completion: 92 },
    { name: "Physics", students: 312, completion: 84 }
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
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name || 'Admin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-2xl bg-gradient-primary p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Users */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Recent Users
                </CardTitle>
                <CardDescription>Latest registered users in the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUsers.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-white font-semibold">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{user.role} • {user.joinDate}</p>
                      </div>
                    </div>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Users
                </Button>
              </CardContent>
            </Card>

            {/* Course Statistics */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Course Statistics
                </CardTitle>
                <CardDescription>Top performing departments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseStats.map((course, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{course.name}</h4>
                        <p className="text-sm text-muted-foreground">{course.students} students enrolled</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{course.completion}%</p>
                        <p className="text-xs text-muted-foreground">completion</p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div 
                        className="h-full bg-gradient-primary transition-all"
                        style={{ width: `${course.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* System Alerts */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {systemAlerts.map((alert, idx) => (
                  <div key={idx} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-start gap-2">
                      <Badge 
                        variant={
                          alert.type === "success" ? "default" : 
                          alert.type === "info" ? "secondary" : 
                          "destructive"
                        }
                        className="mt-1"
                      >
                        {alert.type}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Courses
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
