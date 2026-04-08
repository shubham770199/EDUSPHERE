// import { useState } from "react";
// import axios from "axios";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const submit = async (e:any) => {
//     e.preventDefault(); //  page reload stop

//     try {
//       const res = await axios.post("http://localhost:5000/api/login", {
//         email,
//         password,
//       });

//       alert(res.data.message);
//     } catch (err:any) {
//       alert("Login Failed ");
//       console.log(err.response?.data);
//     }
//   };

//   return (
//     <div style={{ padding: 40 }}>
//       <form onSubmit={submit}>
//         <h2>Login</h2>

//         <input
//           placeholder="email"
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <br />

//         <input
//           type="password"
//           placeholder="password"
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <br />

//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }
// pages/Login.tsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.post(`${apiUrl}/api/login`, {
        email,
        password,
      });

      alert(res.data.message);
      if(res.data.user) {
        navigate(`/${res.data.user.role}`); // route to dashboard if role exists
      }
    } catch (err: any) {
      console.error(err.response?.data || err);
      alert("Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob dark:bg-purple-900/40"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animate-delay-2000 dark:bg-blue-900/40"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animate-delay-4000 dark:bg-indigo-900/40"></div>

      {/* Main Form */}
      <div className="w-full max-w-md space-y-6 relative z-10 p-4">
        {/* Header */}
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
          <h1 className="text-3xl font-extrabold mb-2 bg-gradient-primary bg-clip-text text-transparent">Welcome Back</h1>
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
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 dark:bg-black/50 focus:ring-2 focus:ring-primary transition-all duration-300"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-md font-bold rounded-full bg-gradient-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 mt-4"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-primary hover:underline font-bold transition-all duration-300"
              >
                Create one now
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}