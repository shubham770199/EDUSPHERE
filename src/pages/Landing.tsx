import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Award, TrendingUp, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Student Portal",
      description: "Access your courses, assignments, grades, and attendance in one place",
      icon: GraduationCap,
      path: "/student",
      color: "bg-gradient-primary"
    },
    {
      title: "Teacher Portal",
      description: "Manage classes, assignments, attendance, and student performance",
      icon: Users,
      path: "/teacher",
      color: "bg-gradient-accent"
    },
    {
      title: "Admin Panel",
      description: "Complete system control, user management, and analytics dashboard",
      icon: BookOpen,
      path: "/admin",
      color: "bg-gradient-primary"
    }
  ];

  const features = [
    {
      icon: Award,
      title: "Gamification",
      description: "Earn badges and rewards for achievements"
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Track progress with detailed insights"
    },
    {
      icon: MessageSquare,
      title: "AI Assistant",
      description: "24/7 support chatbot for queries"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob dark:bg-purple-900/40"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animate-delay-2000 dark:bg-blue-900/40"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animate-delay-4000 dark:bg-indigo-900/40"></div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-12 overflow-hidden">
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl relative">
             {/* Glow behind title */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-hero blur-[100px] opacity-20 -z-10"></div>
            
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
              Cloud-Based Education
              <span className="block bg-gradient-primary bg-clip-text text-transparent animate-pulse-glow">
                Management System
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl font-medium">
              A secure, scalable platform that automates academic activities and enhances collaboration
              between students, teachers, and administrators.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="shadow-elevated rounded-full px-8 bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-md h-12" onClick={() => navigate("/register")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 hover:-translate-y-1 transition-all duration-300 glass-card text-md h-12 border-2" onClick={() => navigate("/login")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Cards */}
      <section className="container relative z-10 mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-4xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">Choose Your Portal</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <Card
              key={role.title}
              className="glass-card group cursor-pointer overflow-hidden border transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl bg-white/40 dark:bg-black/40"
              onClick={() => navigate(role.path)}
            >
              <div className="p-8">
                <div className={`mb-6 inline-flex rounded-2xl ${role.color} p-4 text-white shadow-card group-hover:animate-float transition-all duration-300`}>
                  <role.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-2xl font-bold bg-gradient-to-r from-gray-800 to-black dark:from-gray-100 dark:to-white bg-clip-text text-transparent">{role.title}</h3>
                <p className="text-muted-foreground font-medium">{role.description}</p>
                <Button className="mt-6 w-full group-hover:bg-primary group-hover:text-white transition-all duration-300 rounded-full border-2" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(role.path); }}>
                  Access Portal
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-extrabold bg-gradient-hero bg-clip-text text-transparent">Advanced Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="text-center group p-6 rounded-3xl glass-card transition-all duration-300 hover:-translate-y-2">
                <div className="mb-4 inline-flex rounded-2xl bg-gradient-accent p-4 text-white shadow-card group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container relative z-10 mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl glass-panel p-12 rounded-[3rem]">
          <h2 className="mb-4 text-4xl font-extrabold">Ready to Transform Your Education Experience?</h2>
          <p className="mb-8 text-lg text-muted-foreground font-medium">
            Join thousands of institutions already using our platform. Your journey to seamless management starts here.
          </p>
          <Button size="lg" className="shadow-elevated rounded-full px-10 text-lg h-14 bg-gradient-primary hover:opacity-90 hover:scale-105 transition-all duration-300" onClick={() => navigate("/register")}>
            Start Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
