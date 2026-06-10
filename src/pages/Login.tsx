import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const DEMO_ACCOUNTS = [
  { label: "Student", email: "yash@edusphere.com" },
  { label: "Teacher", email: "teacher@edusphere.com" },
  { label: "Admin", email: "admin@edusphere.com" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      navigate(`/${user.role}`);
    } catch {
      // toast handled in context
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob dark:bg-purple-900/40"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animate-delay-2000 dark:bg-blue-900/40"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animate-delay-4000 dark:bg-indigo-900/40"></div>

      <div className="w-full max-w-md space-y-6 relative z-10 p-4">
        <div className="text-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-12 left-0 hover:bg-black/5"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="inline-flex items-center justify-center p-3 bg-gradient-primary rounded-2xl mb-4 text-white shadow-elevated">
            <LogIn className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-muted-foreground font-medium">Log into your EduSphere account</p>
        </div>

        <Card className="glass-panel border-0 shadow-elevated overflow-hidden rounded-3xl">
          <CardContent className="p-8">
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 dark:bg-black/50 focus:ring-2 focus:ring-primary transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 dark:bg-black/50 focus:ring-2 focus:ring-primary transition-all duration-300 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-md font-bold rounded-full bg-gradient-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 mt-4"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo quick-login for the college project demo */}
            <div className="mt-6">
              <p className="text-center text-xs text-muted-foreground mb-2">
                Quick demo login (password: <code>password123</code>)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((a) => (
                  <Button
                    key={a.email}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => fillDemo(a.email)}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-bold">
                Create one now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
